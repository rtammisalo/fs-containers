import React from 'react'
import '@testing-library/jest-dom/extend-expect'
import { render, screen } from '@testing-library/react'
import Todo from './Todo'

test('renders todo', () => {
  const todo = {
    text: 'Make an actually good todo test content.',
    done: false
  }

  render(<Todo todo={todo} doneInfo={<></>} notDoneInfo={<></>} />)

  const element = screen.getByText('Make an actually good todo test content.')
  expect(element).toBeDefined()
})