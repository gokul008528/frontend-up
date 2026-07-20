import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import ChangePasswordPage from '../../pages/ChangePasswordPage'
import { useAuth } from '../../context/AuthContext'

vi.mock('../../context/AuthContext', () => ({
  useAuth: vi.fn(),
}))

function fillAndSubmit({ current = 'oldpassword', next = 'newpassword1', confirm = 'newpassword1' } = {}) {
  fireEvent.change(screen.getAllByPlaceholderText('••••••••')[0], { target: { value: current } })
  fireEvent.change(screen.getAllByPlaceholderText('••••••••')[1], { target: { value: next } })
  fireEvent.change(screen.getAllByPlaceholderText('••••••••')[2], { target: { value: confirm } })
  fireEvent.click(screen.getByRole('button', { name: /save new password/i }))
}

describe('ChangePasswordPage', () => {
  it('shows a success state after changing the password', async () => {
    const changePassword = vi.fn().mockResolvedValue()
    useAuth.mockReturnValue({
      user: { email: 'someone@example.com', hasPasswordProvider: true },
      changePassword,
    })
    render(
      <MemoryRouter>
        <ChangePasswordPage />
      </MemoryRouter>
    )

    fillAndSubmit()

    await waitFor(() => expect(screen.getByText(/password updated/i)).toBeInTheDocument())
    expect(changePassword).toHaveBeenCalledWith('oldpassword', 'newpassword1')
  })

  it('blocks submission when the new passwords do not match', async () => {
    const changePassword = vi.fn()
    useAuth.mockReturnValue({
      user: { email: 'someone@example.com', hasPasswordProvider: true },
      changePassword,
    })
    render(
      <MemoryRouter>
        <ChangePasswordPage />
      </MemoryRouter>
    )

    fillAndSubmit({ confirm: 'somethingelse1' })

    await waitFor(() => expect(screen.getByText(/do not match/i)).toBeInTheDocument())
    expect(changePassword).not.toHaveBeenCalled()
  })

  it('shows a friendly message for the wrong current password', async () => {
    const err = new Error('wrong password')
    err.code = 'auth/wrong-password'
    const changePassword = vi.fn().mockRejectedValue(err)
    useAuth.mockReturnValue({
      user: { email: 'someone@example.com', hasPasswordProvider: true },
      changePassword,
    })
    render(
      <MemoryRouter>
        <ChangePasswordPage />
      </MemoryRouter>
    )

    fillAndSubmit()

    await waitFor(() => expect(screen.getByText(/current password is incorrect/i)).toBeInTheDocument())
  })

  it('hides the form for Google-only accounts', () => {
    useAuth.mockReturnValue({
      user: { email: 'someone@example.com', hasPasswordProvider: false },
      changePassword: vi.fn(),
    })
    render(
      <MemoryRouter>
        <ChangePasswordPage />
      </MemoryRouter>
    )

    expect(screen.getByText(/no password to change/i)).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /save new password/i })).not.toBeInTheDocument()
  })
})
