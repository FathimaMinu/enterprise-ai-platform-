import React from 'react';

/**
 * Reusable toggle/switch component.
 * Usage: <Toggle on={value} onChange={(newVal) => setValue(newVal)} disabled={false} />
 */
export default function Toggle({ on, onChange, disabled = false }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      disabled={disabled}
      onClick={() => !disabled && onChange(!on)}
      style={{
        position: 'relative',
        width: 44, height: 24,
        borderRadius: 12,
        border: 'none',
        background: on ? '#2563eb' : 'rgba(255,255,255,0.1)',
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.5 : 1,
        transition: 'background 0.25s',
        flexShrink: 0,
      }}
    >
      <span style={{
        position: 'absolute',
        top: 2,
        left: on ? 22 : 2,
        width: 20, height: 20,
        borderRadius: '50%',
        background: 'white',
        transition: 'left 0.25s',
        display: 'block',
        boxShadow: '0 1px 3px rgba(0,0,0,0.3)',
      }} />
    </button>
  );
}
