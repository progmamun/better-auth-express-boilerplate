import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import ms, { StringValue } from 'ms';
import { envVars } from '../../config/env';
import { auth } from '../../lib/auth';
import { CookieUtils } from '../../utils/cookie';
import { tokenUtils } from '../../utils/token';
import { AuthService } from './auth.service';
import catchAsync from '../../utils/catchAsync';
import ApiError from '../../errors/ApiError';
import { sendResponse } from '../../utils/sendResponse';

const registerPlayer = catchAsync(async (req: Request, res: Response) => {
  const maxAge = ms(envVars.ACCESS_TOKEN_EXPIRES_IN as StringValue);
  console.log({ maxAge });
  const payload = req.body;

  // console.log(payload);

  const result = await AuthService.registerPlayer(payload);

  const { accessToken, refreshToken, token, ...rest } = result;

  tokenUtils.setAccessTokenCookie(res, accessToken);
  tokenUtils.setRefreshTokenCookie(res, refreshToken);
  tokenUtils.setBetterAuthSessionCookie(res, token as string);

  sendResponse(res, {
    httpStatusCode: StatusCodes.CREATED,
    success: true,
    message: 'Player registered successfully',
    data: {
      token,
      accessToken,
      refreshToken,
      ...rest,
    },
  });
});

const loginUser = catchAsync(async (req: Request, res: Response) => {
  const payload = req.body;
  const result = await AuthService.loginUser(payload);
  const { accessToken, refreshToken, token, ...rest } = result;

  tokenUtils.setAccessTokenCookie(res, accessToken);
  tokenUtils.setRefreshTokenCookie(res, refreshToken);
  tokenUtils.setBetterAuthSessionCookie(res, token);

  sendResponse(res, {
    httpStatusCode: StatusCodes.OK,
    success: true,
    message: 'User logged in successfully',
    data: {
      token,
      accessToken,
      refreshToken,
      ...rest,
    },
  });
});

const getMe = catchAsync(async (req: Request, res: Response) => {
  const user = req.user;
  // console.log({ user });
  const result = await AuthService.getMe(user);
  sendResponse(res, {
    httpStatusCode: StatusCodes.OK,
    success: true,
    message: 'User profile fetched successfully',
    data: result,
  });
});

const getNewToken = catchAsync(async (req: Request, res: Response) => {
  // console.log('COOKIES:', req.cookies);

  const refreshToken = req.cookies.refreshToken;

  const betterAuthSessionToken =
    req.cookies?.['better-auth.session_token'] ||
    req.cookies?.['better-auth']?.session_token;

  if (!refreshToken) {
    throw new ApiError(StatusCodes.UNAUTHORIZED, 'Refresh token is missing');
  }

  if (!betterAuthSessionToken) {
    throw new ApiError(StatusCodes.UNAUTHORIZED, 'Session token missing');
  }

  const result = await AuthService.getNewToken(
    refreshToken,
    betterAuthSessionToken
  );

  const { accessToken, refreshToken: newRefreshToken, sessionToken } = result;

  tokenUtils.setAccessTokenCookie(res, accessToken);
  tokenUtils.setRefreshTokenCookie(res, newRefreshToken);
  tokenUtils.setBetterAuthSessionCookie(res, sessionToken);

  sendResponse(res, {
    httpStatusCode: StatusCodes.OK,
    success: true,
    message: 'New tokens generated successfully',
    data: {
      accessToken,
      refreshToken: newRefreshToken,
      sessionToken,
    },
  });
});

const changePassword = catchAsync(async (req: Request, res: Response) => {
  const payload = req.body;
  const betterAuthSessionToken = req.cookies['better-auth.session_token'];

  const result = await AuthService.changePassword(
    payload,
    betterAuthSessionToken
  );

  const { accessToken, refreshToken, token } = result;

  tokenUtils.setAccessTokenCookie(res, accessToken);
  tokenUtils.setRefreshTokenCookie(res, refreshToken);
  tokenUtils.setBetterAuthSessionCookie(res, token as string);

  sendResponse(res, {
    httpStatusCode: StatusCodes.OK,
    success: true,
    message: 'Password changed successfully',
    data: result,
  });
});

const logoutUser = catchAsync(async (req: Request, res: Response) => {
  const betterAuthSessionToken = req.cookies['better-auth.session_token'];
  const result = await AuthService.logoutUser(betterAuthSessionToken);

  CookieUtils.clearCookie(res, 'accessToken', {
    httpOnly: true,
    secure: true,
    sameSite: 'none',
  });
  CookieUtils.clearCookie(res, 'refreshToken', {
    httpOnly: true,
    secure: true,
    sameSite: 'none',
  });
  CookieUtils.clearCookie(res, 'better-auth.session_token', {
    httpOnly: true,
    secure: true,
    sameSite: 'none',
  });

  sendResponse(res, {
    httpStatusCode: StatusCodes.OK,
    success: true,
    message: 'User logged out successfully',
    data: result,
  });
});

const verifyEmail = catchAsync(async (req: Request, res: Response) => {
  const { email, otp } = req.body;
  await AuthService.verifyEmail(email, otp);

  sendResponse(res, {
    httpStatusCode: StatusCodes.OK,
    success: true,
    message: 'Email verified successfully',
  });
});

const forgetPassword = catchAsync(async (req: Request, res: Response) => {
  const { email } = req.body;
  await AuthService.forgetPassword(email);

  sendResponse(res, {
    httpStatusCode: StatusCodes.OK,
    success: true,
    message: 'Password reset OTP sent to email successfully',
  });
});

const resetPassword = catchAsync(async (req: Request, res: Response) => {
  const { email, otp, newPassword } = req.body;
  await AuthService.resetPassword(email, otp, newPassword);

  sendResponse(res, {
    httpStatusCode: StatusCodes.OK,
    success: true,
    message: 'Password reset successfully',
  });
});

const resendOTP = catchAsync(async (req: Request, res: Response) => {
  const { email, type } = req.body;
  await AuthService.resendOTP(email, type);

  sendResponse(res, {
    httpStatusCode: StatusCodes.OK,
    success: true,
    message: 'OTP resent successfully',
  });
});

// /api/v1/auth/login/google?redirect=/profile
const googleLogin = catchAsync((req: Request, res: Response) => {
  const redirectPath = req.query.redirect || '/dashboard';

  const encodedRedirectPath = encodeURIComponent(redirectPath as string);

  const callbackURL = `${envVars.BETTER_AUTH_URL}/api/v1/auth/google/success?redirect=${encodedRedirectPath}`;

  res.render('googleRedirect', {
    callbackURL: callbackURL,
    betterAuthUrl: envVars.BETTER_AUTH_URL,
  });
});

const googleLoginSuccess = catchAsync(async (req: Request, res: Response) => {
  const redirectPath = (req.query.redirect as string) || '/dashboard';

  const session = await auth.api.getSession({
    headers: { cookie: req.headers.cookie || '' },
  });

  if (!session?.user) {
    return res.redirect(`${envVars.FRONTEND_URL}/login?error=no_session_found`);
  }

  const result = await AuthService.googleLoginSuccess(session);
  const { accessToken, refreshToken } = result;

  const isValidRedirectPath =
    redirectPath.startsWith('/') && !redirectPath.startsWith('//');
  const finalRedirectPath = isValidRedirectPath ? redirectPath : '/dashboard';

  // Pass tokens to frontend via query params, let frontend set cookies
  const params = new URLSearchParams({
    accessToken,
    refreshToken,
    sessionToken: session.session.token,
    redirect: finalRedirectPath,
  });

  res.redirect(`${envVars.FRONTEND_URL}/api/auth/google/callback?${params}`);
});

const handleOAuthError = catchAsync((req: Request, res: Response) => {
  const error = (req.query.error as string) || 'oauth_failed';
  res.redirect(`${envVars.FRONTEND_URL}/login?error=${error}`);
});

export const AuthController = {
  registerPlayer,
  loginUser,
  getMe,
  getNewToken,
  changePassword,
  logoutUser,
  verifyEmail,
  forgetPassword,
  resetPassword,
  resendOTP,
  googleLogin,
  googleLoginSuccess,
  handleOAuthError,
};
