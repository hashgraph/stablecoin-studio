import type {ReactNode} from 'react';
import clsx from 'clsx';
import Heading from '@theme/Heading';
import styles from './styles.module.css';

type FeatureItem = {
  title: string;
  description: ReactNode;
};

const FeatureList: FeatureItem[] = [
  {
    title: 'Issue and Manage Stablecoins',
    description: (
      <>
        Deploy fully configured stablecoins on <b>Hedera</b> in a single transaction.
        Control supply with separated mint and burn roles, enforce KYC and compliance,
        and link to proof-of-reserve data feeds — all through upgradeable smart contracts.
      </>
    ),
  },
  {
    title: 'Five Modules, One Stack',
    description: (
      <>
        Smart contracts define on-chain rules. The TypeScript SDK provides programmatic access.
        A CLI, a React Web DApp, and a NestJS backend expose those capabilities to operators,
        administrators, and integrators through the interface they prefer.
      </>
    ),
  },
  {
    title: 'Built for Institutions',
    description: (
      <>
        Fine-grained role-based access control, multisignature transaction coordination,
        Chainlink-compatible reserve verification, and a diamond proxy pattern that lets you
        upgrade compliance logic across all tokens without redeployment.
      </>
    ),
  },
];

function Feature({title, description}: FeatureItem) {
  return (
    <div className={clsx('col col--4')}>
      <div className="text--center padding-horiz--md" style={{paddingTop: '2rem'}}>
        <Heading as="h3">{title}</Heading>
        <p>{description}</p>
      </div>
    </div>
  );
}

export default function HomepageFeatures(): ReactNode {
  return (
    <section className={styles.features}>
      <div className="container">
        <div className="row">
          {FeatureList.map((props, idx) => (
            <Feature key={idx} {...props} />
          ))}
        </div>
      </div>
    </section>
  );
}
