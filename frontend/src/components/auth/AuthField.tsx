type AuthFieldProps = {
  label: string
  value: string
  onChange: (value: string) => void
  type?: string
  placeholder?: string
  required?: boolean
}

export default function AuthField({
  label,
  value,
  onChange,
  type = 'text',
  placeholder,
  required = true,
}: AuthFieldProps) {
  return (
    <label className="block">
      <span className="auth-label">{label}</span>
      <input
        className="auth-input"
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        required={required}
      />
    </label>
  )
}
