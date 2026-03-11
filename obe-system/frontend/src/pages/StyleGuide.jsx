import React from 'react';

/**
 * Style Guide Component
 * Demonstrates all available Tailwind styles and custom components
 * This page can be used as a reference during development
 */
const StyleGuide = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            OBE System Style Guide
          </h1>
          <p className="text-gray-600">
            Professional theme configuration with Tailwind CSS
          </p>
        </div>

        {/* Colors */}
        <section className="card mb-8">
          <div className="card-header">
            <h2 className="card-title">Color Palette</h2>
          </div>
          <div className="card-body">
            <div className="grid grid-cols-5 gap-4">
              {/* Primary */}
              <div>
                <h3 className="text-sm font-medium mb-2">Primary (Blue)</h3>
                <div className="space-y-1">
                  <div className="h-10 bg-primary-500 rounded flex items-center justify-center text-white text-xs">
                    500
                  </div>
                  <div className="h-8 bg-primary-600 rounded flex items-center justify-center text-white text-xs">
                    600
                  </div>
                  <div className="h-8 bg-primary-700 rounded flex items-center justify-center text-white text-xs">
                    700
                  </div>
                </div>
              </div>

              {/* Secondary */}
              <div>
                <h3 className="text-sm font-medium mb-2">Secondary (Indigo)</h3>
                <div className="space-y-1">
                  <div className="h-10 bg-secondary-500 rounded flex items-center justify-center text-white text-xs">
                    500
                  </div>
                  <div className="h-8 bg-secondary-600 rounded flex items-center justify-center text-white text-xs">
                    600
                  </div>
                  <div className="h-8 bg-secondary-700 rounded flex items-center justify-center text-white text-xs">
                    700
                  </div>
                </div>
              </div>

              {/* Success */}
              <div>
                <h3 className="text-sm font-medium mb-2">Success (Green)</h3>
                <div className="space-y-1">
                  <div className="h-10 bg-success-500 rounded flex items-center justify-center text-white text-xs">
                    500
                  </div>
                  <div className="h-8 bg-success-600 rounded flex items-center justify-center text-white text-xs">
                    600
                  </div>
                  <div className="h-8 bg-success-700 rounded flex items-center justify-center text-white text-xs">
                    700
                  </div>
                </div>
              </div>

              {/* Warning */}
              <div>
                <h3 className="text-sm font-medium mb-2">Warning (Amber)</h3>
                <div className="space-y-1">
                  <div className="h-10 bg-warning-500 rounded flex items-center justify-center text-white text-xs">
                    500
                  </div>
                  <div className="h-8 bg-warning-600 rounded flex items-center justify-center text-white text-xs">
                    600
                  </div>
                  <div className="h-8 bg-warning-700 rounded flex items-center justify-center text-white text-xs">
                    700
                  </div>
                </div>
              </div>

              {/* Danger */}
              <div>
                <h3 className="text-sm font-medium mb-2">Danger (Red)</h3>
                <div className="space-y-1">
                  <div className="h-10 bg-danger-500 rounded flex items-center justify-center text-white text-xs">
                    500
                  </div>
                  <div className="h-8 bg-danger-600 rounded flex items-center justify-center text-white text-xs">
                    600
                  </div>
                  <div className="h-8 bg-danger-700 rounded flex items-center justify-center text-white text-xs">
                    700
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Buttons */}
        <section className="card mb-8">
          <div className="card-header">
            <h2 className="card-title">Buttons</h2>
          </div>
          <div className="card-body space-y-4">
            {/* Solid Buttons */}
            <div>
              <h3 className="text-sm font-medium mb-2">Solid Buttons</h3>
              <div className="flex flex-wrap gap-2">
                <button className="btn-primary">Primary</button>
                <button className="btn-secondary">Secondary</button>
                <button className="btn-success">Success</button>
                <button className="btn-warning">Warning</button>
                <button className="btn-danger">Danger</button>
              </div>
            </div>

            {/* Outline Buttons */}
            <div>
              <h3 className="text-sm font-medium mb-2">Outline Buttons</h3>
              <div className="flex flex-wrap gap-2">
                <button className="btn-outline">Outline</button>
                <button className="btn-outline-primary">Outline Primary</button>
                <button className="btn-outline-secondary">Outline Secondary</button>
                <button className="btn-outline-danger">Outline Danger</button>
              </div>
            </div>

            {/* Ghost Buttons */}
            <div>
              <h3 className="text-sm font-medium mb-2">Ghost Buttons</h3>
              <div className="flex flex-wrap gap-2">
                <button className="btn-ghost">Ghost</button>
                <button className="btn-ghost-primary">Ghost Primary</button>
              </div>
            </div>

            {/* Button Sizes */}
            <div>
              <h3 className="text-sm font-medium mb-2">Button Sizes</h3>
              <div className="flex flex-wrap items-center gap-2">
                <button className="btn-primary btn-sm">Small</button>
                <button className="btn-primary">Medium</button>
                <button className="btn-primary btn-lg">Large</button>
                <button className="btn-primary btn-xl">Extra Large</button>
              </div>
            </div>

            {/* Disabled */}
            <div>
              <h3 className="text-sm font-medium mb-2">Disabled State</h3>
              <div className="flex flex-wrap gap-2">
                <button className="btn-primary" disabled>
                  Disabled Primary
                </button>
                <button className="btn-outline-primary" disabled>
                  Disabled Outline
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Form Inputs */}
        <section className="card mb-8">
          <div className="card-header">
            <h2 className="card-title">Form Inputs</h2>
          </div>
          <div className="card-body space-y-4">
            {/* Text Input */}
            <div>
              <label className="label">Email Address</label>
              <input type="email" className="input" placeholder="Enter your email" />
            </div>

            {/* Input with Error */}
            <div>
              <label className="label label-required">Password</label>
              <input type="password" className="input input-error" placeholder="Enter password" />
              <p className="error-message">Password must be at least 8 characters</p>
            </div>

            {/* Select */}
            <div>
              <label className="label">Department</label>
              <select className="select">
                <option>Select a department</option>
                <option>Computer Science</option>
                <option>Electrical Engineering</option>
                <option>Mechanical Engineering</option>
              </select>
            </div>

            {/* Textarea */}
            <div>
              <label className="label">Description</label>
              <textarea className="textarea" placeholder="Enter description"></textarea>
              <p className="helper-text">Maximum 500 characters</p>
            </div>

            {/* Checkbox */}
            <div className="flex items-center gap-2">
              <input type="checkbox" id="terms" className="checkbox" />
              <label htmlFor="terms" className="text-sm text-gray-700">
                I agree to the terms and conditions
              </label>
            </div>

            {/* Radio */}
            <div className="space-y-2">
              <label className="label">Role</label>
              <div className="flex items-center gap-2">
                <input type="radio" id="student" name="role" className="radio" />
                <label htmlFor="student" className="text-sm text-gray-700">
                  Student
                </label>
              </div>
              <div className="flex items-center gap-2">
                <input type="radio" id="teacher" name="role" className="radio" />
                <label htmlFor="teacher" className="text-sm text-gray-700">
                  Teacher
                </label>
              </div>
            </div>
          </div>
        </section>

        {/* Tables */}
        <section className="card mb-8">
          <div className="card-header">
            <h2 className="card-title">Tables</h2>
          </div>
          <div className="card-body">
            <div className="table-container">
              <table className="table">
                <thead>
                  <tr>
                    <th className="sortable">Course Code</th>
                    <th className="sortable">Course Title</th>
                    <th>Credits</th>
                    <th>Department</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>CS101</td>
                    <td>Introduction to Programming</td>
                    <td>3</td>
                    <td>Computer Science</td>
                    <td>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-success-100 text-success-800">
                        Active
                      </span>
                    </td>
                  </tr>
                  <tr>
                    <td>CS201</td>
                    <td>Data Structures</td>
                    <td>4</td>
                    <td>Computer Science</td>
                    <td>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-success-100 text-success-800">
                        Active
                      </span>
                    </td>
                  </tr>
                  <tr>
                    <td>CS301</td>
                    <td>Database Systems</td>
                    <td>3</td>
                    <td>Computer Science</td>
                    <td>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-warning-100 text-warning-800">
                        Pending
                      </span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* Cards */}
        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">Cards</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Standard Card */}
            <div className="card">
              <div className="card-header">
                <h3 className="card-title">Standard Card</h3>
                <p className="card-subtitle">With header and footer</p>
              </div>
              <div className="card-body">
                <p>This is a standard card with header, body, and footer sections.</p>
              </div>
              <div className="card-footer">
                <button className="btn-primary btn-sm">Action</button>
              </div>
            </div>

            {/* Bordered Card */}
            <div className="card card-bordered">
              <div className="card-body">
                <h3 className="text-lg font-semibold mb-2">Bordered Card</h3>
                <p className="text-gray-600">This card has a border instead of a shadow.</p>
              </div>
            </div>

            {/* Hover Card */}
            <div className="card card-hover">
              <div className="card-body">
                <h3 className="text-lg font-semibold mb-2">Hover Card</h3>
                <p className="text-gray-600">
                  Hover over this card to see the lift effect.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Typography */}
        <section className="card mb-8">
          <div className="card-header">
            <h2 className="card-title">Typography</h2>
          </div>
          <div className="card-body space-y-4">
            <h1>Heading 1 - The quick brown fox</h1>
            <h2>Heading 2 - The quick brown fox</h2>
            <h3>Heading 3 - The quick brown fox</h3>
            <h4>Heading 4 - The quick brown fox</h4>
            <h5>Heading 5 - The quick brown fox</h5>
            <h6>Heading 6 - The quick brown fox</h6>
            <p>
              This is a paragraph with regular text. The OBE system uses the Inter font
              family for a modern, professional appearance. This paragraph demonstrates
              the default line height and spacing.
            </p>
            <a href="#" className="inline-block">
              This is a link with hover effect
            </a>
          </div>
        </section>
      </div>
    </div>
  );
};

export default StyleGuide;
