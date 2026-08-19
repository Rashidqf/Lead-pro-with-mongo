/** Encode user/password so special characters like @ in the password don't break the URI. */
export function encodeMongoUri(uri: string): string {
  const match = uri.match(/^(mongodb(?:\+srv)?:\/\/)(.+)$/i);
  if (!match) return uri;
  const [, protocol, rest] = match;
  const at = rest.lastIndexOf("@");
  if (at < 0) return uri;
  const userinfo = rest.slice(0, at);
  const host = rest.slice(at + 1);
  const colon = userinfo.indexOf(":");
  if (colon < 0) return `${protocol}${encodePart(userinfo)}@${host}`;
  return `${protocol}${encodePart(userinfo.slice(0, colon))}:${encodePart(userinfo.slice(colon + 1))}@${host}`;
}

function encodePart(value: string) {
  try {
    return encodeURIComponent(decodeURIComponent(value));
  } catch {
    return encodeURIComponent(value);
  }
}
