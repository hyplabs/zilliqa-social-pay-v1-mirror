import React from 'react';
import styled from 'styled-components';
import * as Effector from 'effector-react';
import { validation } from '@zilliqa-js/util';
import { TwitterTweetEmbed } from 'react-twitter-embed';
import ClipLoader from 'react-spinners/ClipLoader';
import { useMediaQuery } from 'react-responsive';
import { NotificationContainer } from 'react-notifications';

import EventStore from 'store/event';
import UserStore from 'store/user';

import { Modal } from 'components/modal';
import { Card } from 'components/card';
import { FieldInput } from 'components/Input';
import { Text } from 'components/text';
import { Button } from 'components/button';
import { ContainerLoader } from 'components/container-loader';

import {
  ButtonVariants,
  Events,
  SizeComponent,
  FontColors
} from 'config';

const TweetContainer = styled.div`
  display: grid;
  justify-items: center;
`;

const SPINER_SIZE = 150;
const WIDTH_MOBILE = 250;
const WIDTH_DEFAULT = 450;

export const FixedWrapper: React.FC = () => {
  const isTabletOrMobile = useMediaQuery({ query: '(max-width: 546px)' });

  // Effector hooks //
  const eventState = Effector.useStore(EventStore.store);
  const userState = Effector.useStore(UserStore.store);
  // Effector hooks //

  // React hooks //
  const [addressErr, setAddressErr] = React.useState<string | null>(null);
  const [address, setAddress] = React.useState<string>(userState.zilAddress);

  const handleAddressChange = React.useCallback(async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!address) {
      return null;
    } else if (!validation.isBech32(address)) {
      setAddressErr('Incorect address format.');

      return null;
    }

    setAddress(address);

    if (address === userState.zilAddress) {
      return null;
    }

    EventStore.setEvent(Events.Load);
    await UserStore.updateAddress({
      address,
      jwt: userState.jwtToken
    });
    EventStore.reset();
  }, [address, validation, setAddressErr, addressErr]);
  const handleChangeAddress = React.useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = event.target;

    setAddressErr(null);

    if (!value) {
      return null;
    }

    setAddress(value);
  }, [setAddressErr, setAddress]);

  React.useEffect(() => {
    if (!address || address.length < 1) {
      setAddress(userState.zilAddress);
    }
  }, [address, setAddress, userState]);
  // React hooks //

  return (
    <React.Fragment>
      <Modal
        show={eventState.current === Events.Settings}
        onBlur={() => EventStore.reset()}
      >
        <Card title="Settings">
          <Text>
            Your Zilliqa address
          </Text>
          <form onSubmit={handleAddressChange}>
            <FieldInput
              defaultValue={address}
              sizeVariant={SizeComponent.md}
              error={addressErr}
              disabled={userState.zilAddress && userState.zilAddress.includes('padding')}
              css="font-size: 15px;width: 350px;"
              onChange={handleChangeAddress}
            />
            <Button
              sizeVariant={SizeComponent.lg}
              variant={ButtonVariants.primary}
              disabled={Boolean(addressErr || !address || (address === userState.zilAddress))}
              css="margin-top: 10px;"
            >
              Change address
            </Button>
          </form>
        </Card>
      </Modal>
      <Modal
        show={eventState.current === Events.Twitter}
        onBlur={() => EventStore.reset()}
      >
        <Card title="Found tweet">
          {Boolean(eventState.content && eventState.content.id_str) ? (
            <TweetContainer>
              <TwitterTweetEmbed
                screenName={userState.screenName}
                tweetId={eventState.content.id_str}
                options={{
                  width: isTabletOrMobile ? WIDTH_MOBILE : WIDTH_DEFAULT
                }}
              />
              <Button
                sizeVariant={SizeComponent.lg}
                variant={ButtonVariants.primary}
                css="margin-top: 30px;"
              >
                Pay
              </Button>
            </TweetContainer>
          ) : null}
        </Card>
      </Modal>
      <ContainerLoader show={eventState.current === Events.Load}>
        <ClipLoader
          size={SPINER_SIZE}
          color={FontColors.info}
          loading={eventState.current === Events.Load}
        />
      </ContainerLoader>
      {userState.jwtToken ? <NotificationContainer /> : null}
    </React.Fragment>
  );
};
