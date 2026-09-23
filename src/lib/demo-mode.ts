// Explicit opt-in for local/test development only. Production builds always disable it.
export const mockAuthEnabled = (process.env.NODE_ENV === "development" || process.env.NODE_ENV === "test") && process.env.NEXT_PUBLIC_ONE_G_MOCK_AUTH === "1";
export const mockCommerceEnabled = mockAuthEnabled && process.env.NEXT_PUBLIC_ONE_G_MOCK_COMMERCE === "1";
