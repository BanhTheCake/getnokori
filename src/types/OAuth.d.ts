declare module 'nokori' {
  namespace Nokori {
    interface OAuthToken {
      /**
       * The access token you can use to make requests on behalf of this Stripe account. Use it as you would any Stripe secret API key.
       * This key does not expire, but may be revoked by the user at any time (you'll get a account.application.deauthorized webhook event when this happens).
       */
      access_token?: string

      /**
       * The scope granted to the access token, depending on the scope of the authorization code and scope parameter.
       */
      scope?: string

      /**
       * The live mode indicator for the token. If true, the access_token can be used as a live secret key. If false, the access_token can be used as a test secret key.
       * Depends on the mode of the secret API key used to make the request.
       */
      livemode?: boolean

      /**
       * Will always have a value of bearer.
       */
      token_type?: 'bearer'

      /**
       * Can be used to get a new access token of an equal or lesser scope, or of a different live mode (where applicable).
       */
      refresh_token?: string

      /**
       * The unique id of the account you have been granted access to, as a string.
       */
      stripe_user_id?: string

      /**
       * A publishable key that can be used with this account. Matches the mode—live or test—of the token.
       */
      stripe_publishable_key?: string
    }

  }

  interface OAuthTokenParams {
    /**
     * `'authorization_code'` when turning an authorization code into an access token, or `'refresh_token'` when using a refresh token to get a new access token.
     */
    grant_type: 'authorization_code' | 'refresh_token'

    /**
     * The value of the code or refresh_token, depending on the grant_type.
     */
    code?: string

    /**
     * The value of the code or refresh_token, depending on the grant_type.
     */
    refresh_token?: string

    /**
     * When requesting a new access token from a refresh token, any scope that has an equal or lesser scope as the refresh token. Has no effect when requesting an access token from an authorization code.
     * Defaults to the scope of the refresh token.
     */
    scope?: string

    /**
     * Express only
     * Check whether the suggested_capabilities were applied to the connected account.
     */
    assert_capabilities?: Array<string>
  }

}
