import os
import firebase_admin
from firebase_admin import credentials, auth
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer

service_account_path = os.getenv("FIREBASE_SERVICE_ACCOUNT_KEY_PATH")
if not service_account_path:
    raise ValueError("The FIREBASE_SERVICE_ACCOUNT_KEY_PATH environment variable must be set.")


oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

async def get_current_user(token: str = Depends(oauth2_scheme)):
    """
    Dependency to verify Firebase ID token and get user info.
    The frontend will send the user's ID token in the Authorization header
    as a Bearer token.
    """
    try:
        decoded_token = auth.verify_id_token(token)
        uid = decoded_token['uid']
        return {"uid": uid}
    except auth.InvalidIdTokenError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid Firebase ID token",
            headers={"WWW-Authenticate": "Bearer"},
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error verifying token: {e}",
            headers={"WWW-Authenticate": "Bearer"},
        )