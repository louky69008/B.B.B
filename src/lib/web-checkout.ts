export function revenueCatCheckoutUrl(
  purchaseLink: string | undefined,
  userId: string | undefined,
  packageId: string | undefined,
) {
  if (!purchaseLink || !userId || !packageId || !/^[\w$-]+$/.test(packageId)) return null;
  if (!/^[0-9a-f]{8}(?:-[0-9a-f]{4}){3}-[0-9a-f]{12}$/i.test(userId)) return null;

  let url: URL;
  try {
    url = new URL(purchaseLink);
  } catch {
    return null;
  }

  if (
    url.origin !== "https://pay.rev.cat" ||
    url.username ||
    url.password ||
    url.hash ||
    url.search ||
    !/^\/[\w-]+\/?$/.test(url.pathname)
  ) {
    return null;
  }

  url.pathname = `${url.pathname.replace(/\/$/, "")}/${encodeURIComponent(userId)}`;
  url.searchParams.set("package_id", packageId);
  return url.href;
}
