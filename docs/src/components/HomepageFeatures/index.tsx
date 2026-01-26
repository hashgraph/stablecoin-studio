import type {ReactNode} from 'react';
import clsx from 'clsx';
import Heading from '@theme/Heading';
import styles from './styles.module.css';

type FeatureItem = {
  title: string;
  icon: string;
  description: ReactNode;
};

const FeatureList: FeatureItem[] = [
  {
    title: 'Stable Coin Studio',
    icon: "🪙",
    description: (
      <>
        An institutional-grade framework to issue and manage stablecoins on **Hedera**. 
        It leverages the <b>Hedera Token Service (HTS)</b> for speed and <b>Smart Contracts</b> for programmable compliance
      </>
    ),
  },
  {
    title: "Open Source & Docs-as-Code",
    icon: "📚",
    description: (
      <>
        Transparent documentation living with the code. Comprehensive guides and API references enable community
        contribution and seamless integration.
      </>
    ),
  },
];

function Feature({title, icon, description}: FeatureItem) {
  return (
    <div className={clsx("col col--6")}>
      <div className="text--center">
        <span style={{ fontSize: "4rem" }} role="img" aria-label={title}>
          {icon}
        </span>
      </div>
      <div className="text--center padding-horiz--md">
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
