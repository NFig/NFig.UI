import * as React from 'react';
import styled from 'react-emotion';
import { ISetting } from '../../interfaces';

const intersperse = (items: any[], inter: any) =>
  items.reduce((arr, item, i) => {
    if (i > 0) arr.push(inter);
    arr.push(item);
    return arr;
  }, []);

const Div = styled.div`
  font-size: 85%;
  margin-top: 0.5em;
  color: rgba(0, 0, 0, 0.5);

  & div:first-child {
    padding-top: 0.5em;
    border-top: 1px solid rgba(0, 0, 0, 0.05);
  }

  & strong {
    color: rgba(0, 0, 0, 0.6);
  }
`;

export default function OverridesSummary({ setting }: { setting: ISetting }) {
  return (
    <Div>
      {!!setting.activeOverride ? (
        <div>
          Active override: <strong>{setting.activeOverride.dataCenter}</strong>
        </div>
      ) : null}

      {(setting.allOverrides.length > 0 && !setting.activeOverride) ? (
        <div>
          Has overrides for:&nbsp;
          {intersperse(
            setting.allOverrides.map(o => (
              <strong key={o.dataCenter}>{o.dataCenter}</strong>
            )),
            ', ',
          )}
        </div>
      ) : null}
    </Div>
  );
}
