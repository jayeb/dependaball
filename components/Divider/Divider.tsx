import classNames from 'classnames';

import styles from './Divider.module.css';

type DividerProps = {
  size?: 'small' | 'medium' | 'large';
  className?: string;
}

const HEIGHTS = {
  small: 1,
  medium: 7,
  large: 16,
}

function Divider({
  size = 'large',
  className,
}: DividerProps): JSX.Element {
  const height = HEIGHTS[size];

  const style = {
    // We're using a custom CSS property here, so it doesn't exist in the CSSProperties type
    ['--this-height' as any]: `${height}px`,
  };

  return (
    <hr
      className={classNames(styles.divider, className)}
      style={style}
    />
  );
}

export default Divider;
