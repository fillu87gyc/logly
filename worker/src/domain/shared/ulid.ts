/**
 * 最小 ULID 実装（外部依存なし）。
 * - 先頭 48bit がミリ秒タイムスタンプ、残り 80bit が乱数。
 * - Crockford Base32 で 26 文字。辞書順 = ほぼ時系列順にソート可能。
 */
const ENCODING = '0123456789ABCDEFGHJKMNPQRSTVWXYZ' // Crockford Base32（I,L,O,U を除外）
const ENCODING_LEN = ENCODING.length
const TIME_LEN = 10
const RANDOM_LEN = 16

function encodeTime(now: number): string {
  let str = ''
  let t = now
  for (let i = TIME_LEN - 1; i >= 0; i--) {
    const mod = t % ENCODING_LEN
    str = ENCODING[mod] + str
    t = (t - mod) / ENCODING_LEN
  }
  return str
}

function encodeRandom(): string {
  const bytes = new Uint8Array(RANDOM_LEN)
  crypto.getRandomValues(bytes)
  let str = ''
  for (let i = 0; i < RANDOM_LEN; i++) {
    // 各バイトの下位 5bit を 1 文字にマップ（厳密な等確率ではないが衝突実用上問題なし）
    str += ENCODING[bytes[i]! % ENCODING_LEN]
  }
  return str
}

export function ulid(now: number = Date.now()): string {
  return encodeTime(now) + encodeRandom()
}

/** ULID 形式（26 文字・Crockford Base32）かを検証する。 */
export function isUlid(value: string): boolean {
  if (value.length !== TIME_LEN + RANDOM_LEN) return false
  for (const ch of value) {
    if (!ENCODING.includes(ch)) return false
  }
  return true
}
