# tinder-api

`tinder-api` is an unofficial library to interact with Tinder's API. Designed to work seamlessly with both Node.js and Deno, it simplifies the process of performing actions such as liking, disliking, and retrieving profiles, as well as
accessing search results.

## Features

-   Perform searches for profiles.
-   Like, dislike, or super-like profiles.
-   Programmatic login via SMS + (optional) email verification — no need to extract the token manually.
-   Retrieve authenticated user profile information.
-   Update profile, discovery settings and recommendation preference filters (with typed enums for interests, descriptors and languages).
-   Retrieve matches and chat messages.
-   Designed for flexibility and easy integration.

## Installation

### Node.js

Install the package via npm:

```bash
npm install tinder-api-ts
```

```bash
yarn add tinder-api-ts
```

```bash
pnpm i tinder-api-ts
```

### Deno

Import the package directly from the repository URL:

```bash
deno add jsr:@miguelo/tinder-api
```

## Authentication & Initial Configuration

To use the `tinder-api`, you need to retrieve your `X-AUTH-TOKEN` and your `persistent-device-id` from Tinder Web.

The `persistent-device-id` value is obtained from the browser `localStorage` entry with the key `TinderWeb/uuid`.

### Get your X-AUTH-TOKEN

To use the `tinder-api`, you need to retrieve your `X-AUTH-TOKEN` from Tinder Web. Here's how you can obtain it:

### Steps to Get Your Token:

1. Open your browser and navigate to the Tinder website.
2. Open **Developer Tools** (usually by pressing `F12` or `Ctrl+Shift+I`).
3. Go to the **Application** tab.
4. Locate **IndexedDB** in the **Storage** section.
5. Find the `keyval-store` database and the `keyval` store.
6. Search for the key `persist::mfa`.
7. Extract the `authToken` value from the result.

Alternatively, use this script in your browser console to retrieve the token:

```javascript
const dbName = 'keyval-store';
const storeName = 'keyval';
const key = 'persist::mfa';

const dbPromise = indexedDB.open(dbName);

dbPromise.onsuccess = function (event) {
    const db = event.target.result;

    // Creamos una transacción de lectura (Create a read-only transaction)
    const transaction = db.transaction([storeName], 'readonly');

    // Obtenemos el objeto store (Get the store object)
    const objectStore = transaction.objectStore(storeName);

    // Realizamos la petición para obtener el valor (Make the request to get the value)
    const request = objectStore.get(key);

    request.onsuccess = function (event) {
        const result = JSON.parse(event.target.result);
        console.log(result.authToken);
    };

    request.onerror = function (event) {
        console.error('Error al obtener el valor:', event.target.error);
    };
};

dbPromise.onerror = function (event) {
    console.error('Error al abrir la base de datos:', event.target.error);
};
```

### Get your persistent-device-id

To obtain the `persistent-device-id`, open the browser console on the Tinder Web page and run:

```javascript
const persistentDeviceId = window.localStorage.getItem('TinderWeb/uuid');
console.log(persistentDeviceId);
```

You must send this value in the `persistent-device-id` header in every request made by the client.

## Programmatic Login

As an alternative to extracting the `X-AUTH-TOKEN` manually, you can obtain it by logging in with your phone number. The library handles the protobuf flow, SMS OTP verification, and the optional email verification step (multi-factor) automatically.

The `persistent-device-id` should be generated once and persisted between runs (use the same UUID for future logins to avoid being treated as a new device).

### Quick login with callbacks

```typescript
import { LoginSession, TinderAPI } from 'tinder-api';

const deviceId = '<your persistent device id>'; // persist this UUID between runs

const session = new LoginSession({ persistentDeviceId: deviceId });

const { apiToken } = await session.login({
    phoneNumber: '34601381673',
    getSmsCode: ({ otpLength }) => prompt(`SMS code (${otpLength} digits):`)!,
    getEmailCode: ({ emailMasked, otpLength }) => {
        console.log(`Code sent to ${emailMasked}`);
        return prompt(`Email code (${otpLength} digits):`)!;
    },
});

const api = new TinderAPI({
    xAuthToken: apiToken,
    baseOptions: {
        defaultLocale: 'es-ES',
        headers: { 'persistent-device-id': deviceId },
    },
});
```

The callbacks may be sync or async — `getSmsCode` and `getEmailCode` can pull the OTP from any source (a UI prompt, an SMS gateway webhook, IMAP polling, etc.). `getEmailCode` is optional: if Tinder requires email verification and no provider is supplied, a `TinderEmailRequiredError` is thrown instead.

### Step-by-step login (manual control)

If you prefer to drive each step explicitly:

```typescript
import { LoginSession, TinderEmailRequiredError, type LoginSuccessResponse } from 'tinder-api';

const session = new LoginSession({ persistentDeviceId: deviceId });

await session.requestSmsCode({ phoneNumber: '34601381673' });
const smsCode = prompt('SMS code:')!;

let auth: LoginSuccessResponse;
try {
    auth = await session.verifySmsCode({ phoneNumber: '34601381673', otpCode: smsCode });
} catch (e) {
    if (!(e instanceof TinderEmailRequiredError)) throw e;
    const emailCode = prompt(`Email code (sent to ${e.challenge.emailMasked}):`)!;
    auth = await session.verifyEmailCode({ emailCode, jwt: e.challenge.jwt });
}

console.log(auth.apiToken);
```

## Usage

### Init API client example

```typescript
import { TinderAPI } from 'tinder-api';

const api = new TinderAPI({
    xAuthToken: 'your_auth_token',
    baseOptions: {
        defaultLocale: 'es-ES',
        headers: {
            'persistent-device-id': 'your_persistent_device_id', // value from localStorage 'TinderWeb/uuid'
        },
    },
});
```

### Search profiles and give like example

```typescript
const results = await api.search();
const profile = results.data.data.results[0];

// Like a profile
const likeResponse = await api.like({
    s_number: profile.s_number,
    userId: profile.user._id,
    liked_content_id: profile.user.photos.at(0)?.id!,
    liked_content_type: 'photo',
});
```

### Super-like a profile

```typescript
const superLikeResponse = await api.superLike({
    s_number: profile.s_number,
    userId: profile.user._id,
    liked_content_id: profile.user.photos.at(0)?.id!,
    liked_content_type: 'photo',
});

console.log(superLikeResponse.data.super_likes.remaining);
```

### Update profile & discovery preferences

The profile is edited through two endpoints, exposed as `updateProfile`
(`POST /v2/profile`) and `updateUserProfile` (`POST /v2/profile/user`).
`updateProfilePreferences` is an orchestrator that takes a single camelCase
input and calls both — only hitting the endpoint whose fields are present — and
returns `{ profile?, user? }`. All fields are optional, so updates are partial.

```typescript
import {
    TinderAPI,
    UserInterest,
    Descriptor,
    LookingFor,
} from 'tinder-api';

await api.updateProfilePreferences({
    // --- Profile / discovery (POST /v2/profile) ---
    ageFilterMin: 18,
    ageFilterMax: 45,
    distanceFilterKm: 50, // converted to miles for you (see note below)
    autoExpansion: { ageToggle: false, distanceToggle: false },
    bio: 'Loquito ✅',
    discoverable: true,
    genderFilter: 1, // man = 0, woman = 1, everyone = -1
    showGenderOnProfile: true,
    globalMode: {
        isEnabled: true,
        languagePreferences: [
            { language: 'es', isSelected: true },
            { language: 'en', isSelected: true },
        ],
    },

    // --- Recommendation filters (POST /v2/profile/user) — paid feature ---
    userInterests: [UserInterest.ElectronicMusic, 'it_1'], // enum or raw `it_*`
    descriptors: [
        { id: Descriptor.LookingFor, selectedChoices: [LookingFor.ShortTermFun] },
    ],
    hasBio: true,
    numberOfPhotos: 2,
});
```

You can pass the **friendly enums** (`UserInterest`, `Descriptor`, the
per-descriptor choice enums like `LookingFor`/`Zodiac`/`Education`, etc.) **or**
the raw ids interchangeably — enum values are the ids. Invalid ids, or a choice
that doesn't belong to the chosen descriptor, are compile-time errors.

The methods can also be used individually:

```typescript
await api.updateProfile({ ageFilterMax: 40, distanceFilterKm: 30 });
await api.updateUserProfile({ hasBio: true, userInterests: [UserInterest.Coffee] });
```

#### What you can update

**Profile / discovery** (`updateProfile`, free): `ageFilterMin`, `ageFilterMax`,
`distanceFilter`, `distanceFilterKm`, `autoExpansion`, `bio`, `discoverable`,
`genderFilter`, `showGenderOnProfile`, `globalMode`.

**Recommendation filters** (`updateUserProfile`): `userInterests`,
`descriptors`, `hasBio`, `numberOfPhotos`.

> ⚠️ **Paid feature.** The recommendation filters (`updateUserProfile` /
> the filter fields of `updateProfilePreferences`) require an active Tinder
> subscription (Gold/Platinum). If you call them without an eligible
> subscription, Tinder rejects the request and the method **throws an
> `HTTP error`** — wrap it in `try/catch`. The same applies to other premium
> controls (e.g. Passport/global mode on some accounts). Profile/discovery
> fields like age and distance are free.

> 📏 **Distance is in miles.** `distance_filter` is stored by Tinder in **miles**
> regardless of the locale shown in the app (the UI localizes to km). Pass
> `distanceFilterKm` to use kilometers — it's converted (rounded) to miles. If
> both `distanceFilter` and `distanceFilterKm` are given, `distanceFilter`
> (miles) wins. Because miles are integers, some km values aren't exactly
> representable (e.g. 30 km → 19 mi ≈ 31 km in-app).

#### Global mode

Global mode lets you see and match with people around the world and pick which
languages you want to match with. It's set through `updateProfile` (or
`updateProfilePreferences`) under `globalMode`:

```typescript
// Enable global mode
await api.updateProfile({ globalMode: { isEnabled: true } });

// Enable and set the display language
await api.updateProfile({ globalMode: { isEnabled: true, displayLanguage: 'es-ES' } });

// Choose the languages you want to match with
await api.updateProfile({
    globalMode: {
        languagePreferences: [
            { language: 'es', isSelected: true },
            { language: 'en', isSelected: true },
        ],
    },
});
```

`language` is typed as `GlobalModeLanguage` (ISO 639-1 two-letter codes, e.g.
`'es'`, `'en'`, `'fr'`); the full set is also exported as the
`GLOBAL_MODE_LANGUAGES` array. `displayLanguage` uses the full locale (e.g.
`'es-ES'`). The API merges your selection with any languages already enabled.

## API Methods

| Method                                                                                       | Description                                                                                          |
| -------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------- |
| `search(params?: TinderSearchParams): Promise<TinderResponse<TinderSearchResponse>>`         | Search for profiles.                                                                                 |
| `like(params: TinderLikeParams): Promise<TinderResponse<TinderLikeResponse>>`                | Like a profile.                                                                                      |
| `superLike(params: TinderSuperLikeParams): Promise<TinderResponse<TinderSuperLikeResponse>>` | Super-like a profile.                                                                                |
| `dislike(params: TinderDislikeParams): Promise<TinderResponse<TinderDislikeResponse>>`       | Dislike a profile.                                                                                   |
| `profile(params?: TinderProfileParams): Promise<TinderResponse<TinderProfileResponse>>`      | Retrieve authenticated user profile.                                                                 |
| `setLocation(params: TinderLocationParams): Promise<TinderResponse<TinderLocationResponse>>` | Sets the user's location using latitude and longitude. Note: Can only be used once every 10 minutes. |
| `getMatches(params?: TinderMatchesParams): Promise<TinderResponse<TinderMatchesResponse>>` | Retrieve matches for the authenticated user. |
| `getChatMessages(params: TinderChatMessagesParams): Promise<TinderResponse<TinderChatMessagesResponse>>` | Retrieve chat messages for a specific match. |
| `updateProfile(params: TinderUpdateProfileParams): Promise<TinderResponse<TinderUpdateProfileResponse>>` | Update profile / discovery settings (age & distance filters, auto-expansion, bio, gender filter, global mode). |
| `updateUserProfile(params: TinderUpdateUserProfileParams): Promise<TinderResponse<TinderUpdateUserProfileResponse>>` | Update recommendation preference filters (interests, descriptors, has-bio, number of photos). **Requires a paid subscription.** |
| `updateProfilePreferences(params: TinderUpdateProfilePreferencesParams): Promise<{ profile?, user? }>` | Update profile settings and preference filters in a single call (runs `updateProfile` and/or `updateUserProfile`). |

### `LoginSession`

| Method                                                                                                                          | Description                                                                                          |
| ------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------- |
| `new LoginSession(opts?: { persistentDeviceId?: string })`                                                                      | Create a login session. Auto-generates a `persistent-device-id` if not provided (persist it!).       |
| `login(params): Promise<LoginSuccessResponse>`                                                                                   | Full orchestrated flow with `getSmsCode` / `getEmailCode` callbacks. Returns the `apiToken`.         |
| `requestSmsCode(params: { phoneNumber, locale? }): Promise<SmsSentResponse>`                                                    | Triggers Tinder to send an SMS OTP to the phone number.                                              |
| `verifySmsCode(params: { phoneNumber, otpCode, locale? }): Promise<LoginSuccessResponse>`                                       | Verifies the SMS OTP. May throw `TinderEmailRequiredError` if Tinder also requires email validation. |
| `verifyEmailCode(params: { emailCode, jwt, locale? }): Promise<LoginSuccessResponse>`                                           | Verifies the email OTP (multi-factor). The `jwt` comes from `TinderEmailRequiredError.challenge`.    |

## Interfaces

### TinderSearchParams

Parameters for searching profiles.

| Property | Type     | Description                       |
| -------- | -------- | --------------------------------- |
| `locale` | `string` | The locale to use for the search. |

### TinderLikeParams

Parameters for liking a profile.

| Property             | Type     | Description                         |
| -------------------- | -------- | ----------------------------------- |
| `userId`             | `string` | The ID of the profile to like.      |
| `s_number`           | `string` | The session number for the request. |
| `liked_content_id`   | `string` | The ID of the content to like.      |
| `liked_content_type` | `string` | The type of content to like.        |

### TinderSuperLikeParams

Parameters for super-liking a profile.

| Property             | Type     | Description                                |
| -------------------- | -------- | ------------------------------------------ |
| `userId`             | `string` | The ID of the profile to super-like.       |
| `s_number`           | `number` | The session number for the request.        |
| `liked_content_id`   | `string` | The ID of the content to super-like.       |
| `liked_content_type` | `string` | The type of content to super-like.         |
| `locale`             | `string` | Optional locale (defaults to client value).|

### TinderDislikeParams

Parameters for disliking a profile.

| Property   | Type     | Description                         |
| ---------- | -------- | ----------------------------------- |
| `userId`   | `string` | The ID of the profile to dislike.   |
| `s_number` | `string` | The session number for the request. |

### TinderProfileParams

Parameters for retrieving the authenticated user profile.

| Property | Type       | Description                                 |
| -------- | ---------- | ------------------------------------------- |
| `locale` | `string`   | The locale to use for the profile.          |
| `scopes` | `string[]` | Additional data to include in the response. |

### TinderLocationParams

Parameters for setting user location.

| Property | Type     | Description                            |
| -------- | -------- | -------------------------------------- |
| `locale` | `string` | The locale to use for the request.     |
| `lat`    | `number` | Latitude coordinate for the location.  |
| `lon`    | `number` | Longitude coordinate for the location. |

### TinderMatchesParams

Parameters for retrieving matches.

| Property  | Type     | Description                                    |
| --------- | -------- | ---------------------------------------------- |
| `message` | `number` | Number of messages to include in the response. |

### TinderChatMessagesParams

Parameters for retrieving chat messages.

| Property  | Type     | Description                    |
| --------- | -------- | ------------------------------ |
| `matchId` | `string` | The ID of the match to query.  |

### TinderUpdateProfileParams

Parameters for `updateProfile` (`POST /v2/profile`). All optional → partial updates.

| Property              | Type                                                                                     | Description                                                                 |
| --------------------- | ---------------------------------------------------------------------------------------- | --------------------------------------------------------------------------- |
| `ageFilterMin`        | `number`                                                                                 | Minimum age shown in recommendations.                                       |
| `ageFilterMax`        | `number`                                                                                 | Maximum age shown in recommendations.                                       |
| `distanceFilter`      | `number`                                                                                 | Max distance in **miles** (raw API value).                                  |
| `distanceFilterKm`    | `number`                                                                                 | Max distance in **kilometers** (converted to miles; ignored if `distanceFilter` is set). |
| `autoExpansion`       | `{ ageToggle?: boolean; distanceToggle?: boolean }`                                       | Auto-expand age/distance when running low on recs.                          |
| `bio`                 | `string`                                                                                 | Profile bio text.                                                           |
| `discoverable`        | `boolean`                                                                                | Whether the profile is shown in recommendations.                           |
| `genderFilter`        | `-1 \| 0 \| 1`                                                                            | Gender to show (man = 0, woman = 1, everyone = -1).                         |
| `showGenderOnProfile` | `boolean`                                                                                | Whether the gender is displayed on the profile.                            |
| `globalMode`          | `{ isEnabled?: boolean; displayLanguage?: string; languagePreferences?: { language: GlobalModeLanguage; isSelected: boolean }[] }` | Global mode + match languages (ISO 639-1 codes). |
| `locale`              | `string`                                                                                 | Optional locale (defaults to client value).                                |

### TinderUpdateUserProfileParams

Parameters for `updateUserProfile` (`POST /v2/profile/user`) — the recommendation
preference filters. **Requires a paid Tinder subscription.** All optional.

| Property         | Type                                                            | Description                                                       |
| ---------------- | -------------------------------------------------------------- | ---------------------------------------------------------------- |
| `userInterests`  | `(UserInterest \| InterestId)[]`                               | Only show profiles sharing these interests (`it_*`).             |
| `descriptors`    | `DescriptorFilterInput[]`                                      | Only show profiles matching these descriptor choices (`de_*`).   |
| `hasBio`         | `boolean`                                                      | Only show profiles that have a bio.                              |
| `numberOfPhotos` | `number`                                                      | Only show profiles with at least this many photos.              |
| `locale`         | `string`                                                      | Optional locale (defaults to client value).                     |

`TinderUpdateProfilePreferencesParams` is the intersection of both types above
and is used by `updateProfilePreferences`.

### Login types

#### `SmsSentResponse`

| Property         | Type     | Description                                        |
| ---------------- | -------- | -------------------------------------------------- |
| `phone`          | `string` | Phone number that received the SMS.                |
| `otpLength`      | `number` | Expected number of digits of the SMS OTP (e.g. 6). |
| `deliveryMethod` | `number` | Delivery method enum (1 = SMS).                    |

#### `LoginSuccessResponse`

| Property       | Type     | Description                                          |
| -------------- | -------- | ---------------------------------------------------- |
| `apiToken`     | `string` | The `X-AUTH-TOKEN` to pass to the `TinderAPI` client. |
| `refreshToken` | `string` | JWT refresh token returned by Tinder.                |
| `userId`       | `string` | Authenticated user's ObjectId.                       |
| `createdAt`    | `number` | Timestamp (seconds) returned by the server.          |

#### `EmailRequiredChallenge` (inside `TinderEmailRequiredError.challenge`)

| Property      | Type     | Description                                                          |
| ------------- | -------- | -------------------------------------------------------------------- |
| `jwt`         | `string` | Challenge token — pass it back to `verifyEmailCode`.                 |
| `emailMasked` | `string` | Masked email where the code was sent (e.g. `m******v@gmail.com`).    |
| `otpLength`   | `number` | Expected number of digits of the email OTP.                          |

## Error Handling

The library throws detailed errors if a request fails. Wrap your calls in `try-catch` to handle exceptions gracefully.

```typescript
try {
    const results = await api.search();
    console.log(results);
} catch (error) {
    console.error('Error:', error.message);
}
```

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for more details.

## Contributing

Contributions are welcome! If you encounter issues, have ideas for improvements, or want to contribute new features, feel free to open an issue or submit a pull request on the [GitHub repository](https://github.com/Miguelo981/tinder-api).

### Guidelines:

1. **Fork the repository** and create a new branch for your feature or bug fix.
2. Ensure your code adheres to the project's coding standards.
3. Write tests for any new functionality or changes.
4. Submit a detailed pull request describing your changes.

Thank you for your contributions!
