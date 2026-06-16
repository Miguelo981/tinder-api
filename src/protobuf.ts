const textEncoder = new TextEncoder();
const textDecoder = new TextDecoder();

export function encodeVarint(value: number): number[] {
    const out: number[] = [];
    let v = value >>> 0;
    while (v >= 0x80) {
        out.push((v & 0x7f) | 0x80);
        v >>>= 7;
    }
    out.push(v & 0x7f);
    return out;
}

export function encodeString(field: number, value: string): number[] {
    const bytes = textEncoder.encode(value);
    return [
        ...encodeVarint((field << 3) | 2),
        ...encodeVarint(bytes.length),
        ...bytes,
    ];
}

export function encodeMessage(field: number, body: ArrayLike<number>): number[] {
    const arr = Array.from(body);
    return [
        ...encodeVarint((field << 3) | 2),
        ...encodeVarint(arr.length),
        ...arr,
    ];
}

export interface ProtoField {
    field: number;
    wireType: 0 | 2;
    value: number | Uint8Array;
}

export function decodeMessage(bytes: Uint8Array): ProtoField[] {
    const fields: ProtoField[] = [];
    let offset = 0;
    while (offset < bytes.length) {
        const tag = readVarint(bytes, offset);
        offset = tag.offset;
        const field = tag.value >>> 3;
        const wireType = tag.value & 7;
        if (wireType === 0) {
            const v = readVarint(bytes, offset);
            offset = v.offset;
            fields.push({ field, wireType: 0, value: v.value });
        } else if (wireType === 2) {
            const len = readVarint(bytes, offset);
            offset = len.offset;
            const value = bytes.subarray(offset, offset + len.value);
            offset += len.value;
            fields.push({ field, wireType: 2, value });
        } else {
            throw new Error(`Unsupported protobuf wire type: ${wireType}`);
        }
    }
    return fields;
}

export function decodeString(bytes: Uint8Array): string {
    return textDecoder.decode(bytes);
}

function readVarint(bytes: Uint8Array, offset: number): { value: number; offset: number } {
    let value = 0;
    let shift = 0;
    while (true) {
        if (offset >= bytes.length) throw new Error('Unexpected end of varint');
        const byte = bytes[offset++];
        value |= (byte & 0x7f) << shift;
        if ((byte & 0x80) === 0) return { value: value >>> 0, offset };
        shift += 7;
        if (shift > 35) throw new Error('Varint too long');
    }
}
