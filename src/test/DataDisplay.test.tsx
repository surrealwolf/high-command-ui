import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import DataDisplay from '../../components/DataDisplay'

describe('DataDisplay Component', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('rendering', () => {
    it('should render empty state when no data', () => {
      render(
        <DataDisplay
          title="Test Data"
          data={null}
          loading={false}
        />
      )
      expect(screen.getByText(/Test Data/)).toBeInTheDocument()
    })

    it('should render loading state', () => {
      render(
        <DataDisplay
          title="Test Data"
          data={null}
          loading={true}
        />
      )
      expect(screen.getByText(/Loading/i)).toBeInTheDocument()
    })

    it('should render data when provided', () => {
      const testData = {
        status: 'active',
        count: 42
      }

      const { container } = render(
        <DataDisplay
          title="Test Data"
          data={testData}
          loading={false}
        />
      )

      expect(screen.getByText(/Test Data/)).toBeInTheDocument()
      expect(container.textContent).toContain('active')
    })

    it('should render JSON data formatted', () => {
      const testData = {
        mission_time: 1234567890,
        active_battles: 25
      }

      const { container } = render(
        <DataDisplay
          title="War Status"
          data={testData}
          loading={false}
        />
      )

      expect(container.textContent).toContain('mission_time')
      expect(container.textContent).toContain('active_battles')
    })

    it('should render arrays of data', () => {
      const testData = [
        { name: 'Planet A', status: 'defended' },
        { name: 'Planet B', status: 'contested' }
      ]

      const { container } = render(
        <DataDisplay
          title="Planets"
          data={testData}
          loading={false}
        />
      )

      expect(container.textContent).toContain('Planet A')
      expect(container.textContent).toContain('Planet B')
    })
  })

  describe('error handling', () => {
    it('should handle null data gracefully', () => {
      const { container } = render(
        <DataDisplay
          title="Test Data"
          data={null}
          loading={false}
        />
      )
      expect(container).toBeInTheDocument()
    })

    it('should handle undefined data gracefully', () => {
      const { container } = render(
        <DataDisplay
          title="Test Data"
          data={undefined}
          loading={false}
        />
      )
      expect(container).toBeInTheDocument()
    })

    it('should handle empty object', () => {
      const { container } = render(
        <DataDisplay
          title="Test Data"
          data={{}}
          loading={false}
        />
      )
      expect(container).toBeInTheDocument()
    })

    it('should handle empty array', () => {
      const { container } = render(
        <DataDisplay
          title="Test Data"
          data={[]}
          loading={false}
        />
      )
      expect(container).toBeInTheDocument()
    })
  })

  describe('formatting', () => {
    it('should display numeric values', () => {
      const testData = {
        count: 42,
        percentage: 85.5
      }

      const { container } = render(
        <DataDisplay
          title="Stats"
          data={testData}
          loading={false}
        />
      )

      expect(container.textContent).toContain('42')
      expect(container.textContent).toContain('85.5')
    })

    it('should display boolean values', () => {
      const testData = {
        active: true,
        archived: false
      }

      const { container } = render(
        <DataDisplay
          title="Flags"
          data={testData}
          loading={false}
        />
      )

      expect(container.textContent).toContain('true')
      expect(container.textContent).toContain('false')
    })

    it('should display string values', () => {
      const testData = {
        name: 'Super Earth',
        description: 'The last bastion of managed democracy'
      }

      const { container } = render(
        <DataDisplay
          title="Info"
          data={testData}
          loading={false}
        />
      )

      expect(container.textContent).toContain('Super Earth')
      expect(container.textContent).toContain('managed democracy')
    })
  })
})
