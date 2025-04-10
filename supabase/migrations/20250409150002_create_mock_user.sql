-- Migration: Create mock user for development
-- Description: Inserts a mock user with the hardcoded ID we're using in the code

INSERT INTO public.users (
    id,
    username,
    email,
    password_hash,
    email_verified
) VALUES (
    '123e4567-e89b-12d3-a456-426614174000'::uuid,
    'mock_user',
    'mock@example.com',
    md5('mock_password'),  -- Using MD5 as requested
    true
); 