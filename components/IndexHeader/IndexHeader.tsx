import classNames from 'classnames';
import Link from 'next/link'

import Divider from '@/components/Divider/Divider';
import type { SeasonData } from '@/utils/types';

import styles from './IndexHeader.module.css';

type IndexHeaderProps = {
  inProgressSeasons: SeasonData[];
  className?: string;
}

const IndexHeader = ({
  inProgressSeasons,
  className,
}: IndexHeaderProps): JSX.Element => {
  return (
    <header className={classNames(styles.container, className)}>
      <div className={styles.content}>
        <h1 className={styles.title}>
          Dependaball
        </h1>

        <p className={styles.subtitle}>
          The Sport of Builders!
        </p>

        <nav className={styles.nav}>
          {inProgressSeasons.map((seasonData) => (
            <Link href={`/${seasonData.id}`} key={seasonData.id}>
              <a data-icon="🔴"><span>{seasonData.name}</span></a>
            </Link>
          ))}
          <Link href="/draft-pool/90">
            <a data-icon="🧢"><span>Draft Pool</span></a>
          </Link>
        </nav>
      </div>

      <Divider className={styles.divider} />
    </header>
  );
}

export default IndexHeader;
