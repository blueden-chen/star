package net.core.service.oauth2;

import org.scribe.model.*;
import org.scribe.oauth.OAuthService;

import javax.inject.Inject;

/**
 * Created by chenwj on 3/14/15.
 */

public class GithubService {

    @Inject
    private OAuthServiceProvider githubServiceProvider;
    private Token accessToken;
    private OAuthService oAuthService;

    private static final Token EMPTY_TOKEN = null;

    public GithubService(OAuthService oAuthService, String oauthVerifier) {
        this.oAuthService = oAuthService;
        Verifier verifier = new Verifier(oauthVerifier);
        accessToken = oAuthService.getAccessToken(EMPTY_TOKEN, verifier);
    }

    public Response request(final String url) {
        OAuthRequest oauthRequest = new OAuthRequest(Verb.GET, url);
        oAuthService.signRequest(accessToken, oauthRequest);
        return oauthRequest.send();
    }
}
