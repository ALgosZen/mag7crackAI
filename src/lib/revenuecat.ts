import fetch from "node-fetch";

const REVENUECAT_SECRET_KEY = process.env.REVENUECAT_SECRET_API_KEY;

/**
 * Grants a subscription entitlement to a user in RevenueCat via REST API.
 * This links web purchases (Stripe/PayPal) to the mobile app users.
 *
 * @param appUserId The user's internal ID (e.g., Firebase UID)
 * @param entitlementId The RevenueCat entitlement ID (e.g., 'pro' or 'enterprise')
 * @param duration Period of entitlement. 'lifetime' or ISO date.
 */
export async function grantRevenueCatEntitlement(
  appUserId: string,
  entitlementId: string,
  duration: "lifetime" | string = "lifetime"
) {
  if (!REVENUECAT_SECRET_KEY) {
    console.error("[RevenueCat] Missing Secret API Key in environment.");
    return false;
  }

  const url = `https://api.revenuecat.com/v1/subscribers/${appUserId}/entitlements/${entitlementId}/promotional`;

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${REVENUECAT_SECRET_KEY}`,
        "Content-Type": "application/json",
        "X-Platform": "web"
      },
      body: JSON.stringify({
        duration: duration
      })
    });

    if (response.ok) {
      console.log(`[RevenueCat] Successfully granted ${entitlementId} to ${appUserId}`);
      return true;
    } else {
      const errorData = await response.json();
      console.error(`[RevenueCat] Failed to grant entitlement:`, errorData);
      return false;
    }
  } catch (error) {
    console.error(`[RevenueCat] Network error calling REST API:`, error);
    return false;
  }
}

/**
 * Revokes an entitlement if a subscription is cancelled or payment fails.
 */
export async function revokeRevenueCatEntitlement(appUserId: string, entitlementId: string) {
  // Promotionals are usually revoked by granting them a short duration or
  // by using the revoke endpoint if available in your API version.
  // Standard promotional revokes use the 'revoke' endpoint.
  const url = `https://api.revenuecat.com/v1/subscribers/${appUserId}/entitlements/${entitlementId}/revoke_promotional`;

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${REVENUECAT_SECRET_KEY}`,
        "Content-Type": "application/json"
      }
    });
    return response.ok;
  } catch (error) {
    console.error(`[RevenueCat] Error revoking entitlement:`, error);
    return false;
  }
}
