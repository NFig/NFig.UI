import * as React from 'react';
import { keyframes } from 'emotion';
import styled from 'react-emotion';
import { Dictionary } from '../../interfaces';
import { Store } from '../../store';
import { inject, observer } from 'mobx-react';

import Color from 'color';

type TierProps = {
  tier: string;
  tierColors?: Dictionary<string>;
  store?: Store;
};

const TierBanner = inject<TierProps>('tierColors', 'store')(
  observer(({ tier, tierColors, store }: TierProps) => {
    if (!tierColors) {
      throw new Error(
        'No tier colors defined, please specify `tierColors` as a prop to the intial mount() call',
      );
    }

    const baseColor = tierColors[tier];
    if (!baseColor) {
      throw new Error('No color defined for tier: ' + tier);
    }

    const color = baseColor;
    const backgroundColor = Color(baseColor)
      .lightness(90)
      .saturationl(30)
      .hex();

    const borderColor = Color(baseColor)
      .lightness(80)
      .saturationl(20)
      .hex();

    return (
      <TierSection
        color={color}
        backgroundColor={backgroundColor}
        borderColor={borderColor}
        loading={store.loading}
      >
        {tier}
      </TierSection>
    );
  }),
);

export default TierBanner;

// Let's use the Tier banner as a loading bar as well
const LoadingShimmer = keyframes`
  0% {
    background-position-x: -200px;
  }
  100% {
    background-position-x: calc(100% + 200px);
  }
`;

const TierSection: React.StatelessComponent<{
  color: string;
  backgroundColor: string;
  borderColor: string;
  loading: boolean;
}> = styled.section`
  color: ${p => p.color};
  background-color: ${p => p.backgroundColor};
  border: 1px solid ${p => p.borderColor};
  font-weight: bold;
  text-align: center;
  margin: 1em 0;
  padding: 0.3em 0;

  background-image: ${p =>
    p.loading
      ? `linear-gradient(to right, rgba(47,142,28,0) 0px,rgba(47,142,28,.1) 100px,rgba(47,142,28,0) 200px)`
      : 'none'};

  box-sizing: border-box;
  width: 100%;

  background-position: -200px 0;
  background-repeat: no-repeat;
  background-size: 200px 100%;
  animation: ${p =>
    p.loading
      ? `${LoadingShimmer} .5s infinite cubic-bezier(.8, 0, .2, 1)`
      : 'none'};
`;
