/// <reference types="vitest" />
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { LoginForm } from '../LoginForm'
import { useAuth } from '../../providers/AuthProvider'
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest'
import { toast } from 'sonner'
import type { AuthContextType } from '../../providers/AuthProvider'

// Mock dependencies
vi.mock('../../providers/AuthProvider', () => ({
    useAuth: vi.fn()
}))

vi.mock('sonner', () => ({
    toast: {
        success: vi.fn(),
        error: vi.fn()
    }
}))

describe('LoginForm', () => {
    const mockSignIn = vi.fn()
    const user = userEvent.setup()

    beforeEach(() => {
        vi.mocked(useAuth).mockReturnValue({
            signIn: mockSignIn,
            signOut: vi.fn(),
            user: null,
            loading: false
        } as AuthContextType)
    })

    afterEach(() => {
        vi.clearAllMocks()
    })

    it('renders login form with all fields', () => {
        render(<LoginForm />)

        expect(screen.getByRole('textbox', { name: /email/i })).toBeInTheDocument()
        expect(screen.getByLabelText(/password/i)).toBeInTheDocument()
        expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument()
    })

    it('validates required fields', async () => {
        render(<LoginForm />)

        await user.click(screen.getByRole('button', { name: /sign in/i }))

        expect(await screen.findByText(/email is required/i)).toBeInTheDocument()
        expect(await screen.findByText(/password is required/i)).toBeInTheDocument()
    })

    it('validates email format', async () => {
        render(<LoginForm />)

        await user.type(screen.getByRole('textbox', { name: /email/i }), 'invalid-email')
        await user.tab()

        expect(await screen.findByText(/invalid email address/i)).toBeInTheDocument()
    })

    it('validates password requirements', async () => {
        render(<LoginForm />)

        await user.type(screen.getByLabelText(/password/i), 'short')
        await user.tab()

        expect(await screen.findByText(/password must be at least 8 characters/i)).toBeInTheDocument()
    })

    it('submits form with valid data', async () => {
        const validEmail = 'test@example.com'
        const validPassword = 'ValidPass123'

        render(<LoginForm />)

        await user.type(screen.getByRole('textbox', { name: /email/i }), validEmail)
        await user.type(screen.getByLabelText(/password/i), validPassword)
        await user.click(screen.getByRole('button', { name: /sign in/i }))

        await waitFor(() => {
            expect(mockSignIn).toHaveBeenCalledWith(validEmail, validPassword)
            expect(toast.success).toHaveBeenCalledWith('Successfully signed in')
        })
    })

    it('handles sign in error', async () => {
        const error = new Error('Invalid credentials')
        mockSignIn.mockRejectedValueOnce(error)

        render(<LoginForm />)

        await user.type(screen.getByRole('textbox', { name: /email/i }), 'test@example.com')
        await user.type(screen.getByLabelText(/password/i), 'ValidPass123')
        await user.click(screen.getByRole('button', { name: /sign in/i }))

        await waitFor(() => {
            expect(screen.getByText(error.message)).toBeInTheDocument()
            expect(toast.error).toHaveBeenCalledWith(error.message)
        })
    })

    it('disables form during submission', async () => {
        mockSignIn.mockImplementationOnce(() => new Promise(resolve => setTimeout(resolve, 100)))

        render(<LoginForm />)

        await user.type(screen.getByRole('textbox', { name: /email/i }), 'test@example.com')
        await user.type(screen.getByLabelText(/password/i), 'ValidPass123')
        await user.click(screen.getByRole('button', { name: /sign in/i }))

        expect(screen.getByRole('textbox', { name: /email/i })).toBeDisabled()
        expect(screen.getByLabelText(/password/i)).toBeDisabled()
        expect(screen.getByRole('button', { name: /signing in/i })).toBeDisabled()
    })
}) 