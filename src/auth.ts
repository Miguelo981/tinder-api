import { BASE_PATH, DEFAULT_LOCALE } from "@/constants.ts";
import {
  decodeMessage,
  decodeString,
  encodeMessage,
  encodeString,
  type ProtoField,
} from "@/protobuf.ts";
import type { Locale } from "@/types.ts";
import type {
  CaptchaChallenge,
  EmailRequiredChallenge,
  LoginSuccessResponse,
  SmsSentResponse,
} from "@/interfaces/auth.ts";

export type SmsCodeProvider = (
  info: SmsSentResponse,
) => string | Promise<string>;
export type EmailCodeProvider = (
  challenge: EmailRequiredChallenge,
) => string | Promise<string>;

const AUTH_LOGIN_ENDPOINT = `${BASE_PATH}/v3/auth/login`;

const MOBILE_HEADERS = {
  "User-Agent": "Tinder/15.13.0 (iPhone; iOS 17.5; Scale/3.00)",
  "Content-Type": "application/x-protobuf",
  "Accept": "application/x-protobuf",
  "platform": "ios",
  "tinder-version": "15.13.0",
  "app-version": "15130000",
  "is-created-as-guest": "false",
  "x-supported-image-formats": "webp,jpeg",
} as const;

export class TinderCaptchaRequiredError extends Error {
  constructor(public readonly challenge: CaptchaChallenge) {
    super("Tinder login requires CAPTCHA resolution (Arkose Labs).");
    this.name = "TinderCaptchaRequiredError";
  }
}

export class TinderEmailRequiredError extends Error {
  constructor(public readonly challenge: EmailRequiredChallenge) {
    super(
      `Tinder login requires email verification (code sent to ${challenge.emailMasked}).`,
    );
    this.name = "TinderEmailRequiredError";
  }
}

export class TinderLoginError extends Error {
  constructor(
    message: string,
    public readonly status?: number,
    public readonly body?: string,
  ) {
    super(message);
    this.name = "TinderLoginError";
  }
}

export class LoginSession {
  public readonly persistentDeviceId: string;
  private readonly appSessionId: string;
  private readonly funnelSessionId: string;
  private readonly startedAt: number;

  constructor(opts?: { persistentDeviceId?: string }) {
    this.persistentDeviceId = opts?.persistentDeviceId ?? crypto.randomUUID();
    this.appSessionId = crypto.randomUUID();
    this.funnelSessionId = crypto.randomUUID().replace(/-/g, "").slice(0, 16);
    this.startedAt = Date.now();
  }

  async requestSmsCode(
    params: { phoneNumber: string; locale?: Locale },
  ): Promise<SmsSentResponse> {
    const phoneRequest = encodeString(1, params.phoneNumber);
    const body = new Uint8Array(encodeMessage(1, phoneRequest));
    const responseBytes = await this.send(body, params.locale);
    return this.parseResponse(responseBytes, (f) => {
      if (f.field === 4 && f.value instanceof Uint8Array) {
        return parseSmsSent(f.value);
      }
      return undefined;
    }, "sms_sent");
  }

  async verifySmsCode(
    params: { phoneNumber: string; otpCode: string; locale?: Locale },
  ): Promise<LoginSuccessResponse> {
    const phoneRequest = encodeString(1, params.phoneNumber);
    const otpBody = [
      ...encodeMessage(1, phoneRequest),
      ...encodeString(2, params.otpCode),
    ];
    const body = new Uint8Array(encodeMessage(2, otpBody));
    const responseBytes = await this.send(body, params.locale);
    return this.parseResponse(responseBytes, (f) => {
      if (f.field === 8 && f.value instanceof Uint8Array) {
        return parseAuthSuccess(f.value);
      }
      return undefined;
    }, "success");
  }

  async verifyEmailCode(
    params: { emailCode: string; jwt: string; locale?: Locale },
  ): Promise<LoginSuccessResponse> {
    const challengeProof = encodeString(1, params.jwt);
    const emailBody = [
      ...encodeString(2, params.emailCode),
      ...encodeMessage(3, challengeProof),
    ];
    const body = new Uint8Array(encodeMessage(5, emailBody));
    const responseBytes = await this.send(body, params.locale);
    return this.parseResponse(responseBytes, (f) => {
      if (f.field === 8 && f.value instanceof Uint8Array) {
        return parseAuthSuccess(f.value);
      }
      return undefined;
    }, "success");
  }

  async login(params: {
    phoneNumber: string;
    locale?: Locale;
    getSmsCode: SmsCodeProvider;
    getEmailCode?: EmailCodeProvider;
  }): Promise<LoginSuccessResponse> {
    const smsInfo = await this.requestSmsCode({
      phoneNumber: params.phoneNumber,
      locale: params.locale,
    });
    const otpCode = await params.getSmsCode(smsInfo);
    try {
      return await this.verifySmsCode({
        phoneNumber: params.phoneNumber,
        otpCode,
        locale: params.locale,
      });
    } catch (e) {
      if (e instanceof TinderEmailRequiredError && params.getEmailCode) {
        const emailCode = await params.getEmailCode(e.challenge);
        return await this.verifyEmailCode({
          emailCode,
          jwt: e.challenge.jwt,
          locale: params.locale,
        });
      }
      throw e;
    }
  }

  private parseResponse<T>(
    bytes: Uint8Array,
    extract: (f: ProtoField) => T | undefined,
    expected: string,
  ): T {
    for (const f of decodeMessage(bytes)) {
      const value = extract(f);
      if (value !== undefined) return value;
      if (f.field === 6 && f.value instanceof Uint8Array) {
        throw new TinderEmailRequiredError(parseEmailRequired(f.value));
      }
      if (f.field === 16 && f.value instanceof Uint8Array) {
        throw new TinderCaptchaRequiredError(parseCaptchaChallenge(f.value));
      }
    }
    throw new TinderLoginError(
      `Unexpected AuthGatewayResponse: missing ${expected} field`,
    );
  }

  private async send(
    body: Uint8Array,
    locale: Locale | undefined,
  ): Promise<Uint8Array> {
    const url = new URL(AUTH_LOGIN_ENDPOINT);
    url.searchParams.set("locale", locale ?? DEFAULT_LOCALE);

    const elapsed = String(Date.now() - this.startedAt);
    const headers: Record<string, string> = {
      ...MOBILE_HEADERS,
      "app-session-id": this.appSessionId,
      "app-session-time-elapsed": elapsed,
      "user-session-id": "null",
      "user-session-time-elapsed": elapsed,
      "persistent-device-id": this.persistentDeviceId,
      "funnel-session-id": this.funnelSessionId,
    };

    const response = await fetch(url.toString(), {
      method: "POST",
      headers,
      body: body.buffer.slice(
        body.byteOffset,
        body.byteOffset + body.byteLength,
      ) as ArrayBuffer,
    });
    if (!response.ok) {
      const text = await response.text().catch(() => "");
      throw new TinderLoginError(
        `Tinder auth login failed: HTTP ${response.status} ${text}`,
        response.status,
        text,
      );
    }
    return new Uint8Array(await response.arrayBuffer());
  }
}

function parseSmsSent(bytes: Uint8Array): SmsSentResponse {
  let phone = "";
  let otpLength = 0;
  let deliveryMethod = 0;
  for (const f of decodeMessage(bytes)) {
    if (f.field === 2 && f.value instanceof Uint8Array) {
      phone = decodeString(f.value);
    } else if (f.field === 3 && f.value instanceof Uint8Array) {
      otpLength = firstVarint(decodeMessage(f.value), 1) ?? 0;
    } else if (f.field === 4 && f.value instanceof Uint8Array) {
      deliveryMethod = firstVarint(decodeMessage(f.value), 1) ?? 0;
    }
  }
  return { phone, otpLength, deliveryMethod };
}

function parseAuthSuccess(bytes: Uint8Array): LoginSuccessResponse {
  let refreshToken = "";
  let apiToken = "";
  let userId = "";
  let createdAt = 0;
  for (const f of decodeMessage(bytes)) {
    if (!(f.value instanceof Uint8Array)) continue;
    if (f.field === 1) refreshToken = decodeString(f.value);
    else if (f.field === 2) apiToken = decodeString(f.value);
    else if (f.field === 4) userId = decodeString(f.value);
    else if (f.field === 5) {
      createdAt = firstVarint(decodeMessage(f.value), 1) ?? 0;
    }
  }
  return { apiToken, refreshToken, userId, createdAt };
}

function parseEmailRequired(bytes: Uint8Array): EmailRequiredChallenge {
  let jwt = "";
  let emailMasked = "";
  let otpLength = 0;
  for (const f of decodeMessage(bytes)) {
    if (!(f.value instanceof Uint8Array)) continue;
    if (f.field === 1) {
      for (const inner of decodeMessage(f.value)) {
        if (inner.field === 1 && inner.value instanceof Uint8Array) {
          jwt = decodeString(inner.value);
        }
      }
    } else if (f.field === 3) {
      emailMasked = decodeString(f.value);
    } else if (f.field === 4) {
      otpLength = firstVarint(decodeMessage(f.value), 1) ?? 0;
    }
  }
  return { jwt, emailMasked, otpLength };
}

function parseCaptchaChallenge(bytes: Uint8Array): CaptchaChallenge {
  let jwt = "";
  let publicKey = "";
  let blob = "";
  for (const f of decodeMessage(bytes)) {
    if (!(f.value instanceof Uint8Array)) continue;
    if (f.field === 1) jwt = decodeString(f.value);
    else if (f.field === 2) publicKey = decodeString(f.value);
    else if (f.field === 3) blob = decodeString(f.value);
  }
  return { jwt, publicKey, blob };
}

function firstVarint(fields: ProtoField[], field: number): number | undefined {
  for (const f of fields) {
    if (f.field === field && f.wireType === 0 && typeof f.value === "number") {
      return f.value;
    }
  }
  return undefined;
}
