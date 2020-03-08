import fetch from 'isomorphic-unfetch';

import { APIs, HttpMethods } from 'config';
import { FetchUpdateAddress } from 'interfaces';

export const fetchUpdateAddress = async ({ address, jwt }: FetchUpdateAddress) => {
  const url = `${APIs.updateAddress}/${address}`;
  const res = await fetch(url, {
    method: HttpMethods.PUT,
    headers: {
      Authorization: jwt
    },
    body: JSON.stringify({ address })
  });
  const result = await res.json();

  return result;
};
