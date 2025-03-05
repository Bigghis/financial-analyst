export function TextCell({ props }) {
    const value = props.getValue();

    if (!value) return <span>-</span>;

    return <span>{value}</span>
  }
  