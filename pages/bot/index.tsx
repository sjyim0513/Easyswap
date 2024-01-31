import { useState, useEffect } from "react";

import BotComponent from "../../components/ssBot/ssBot";

import { ACTIONS } from "../../stores/constants/constants";
import stores from "../../stores";

function Bot({ changeTheme }) {
  const [account, setAccount] = useState(
    stores.accountStore.getStore("account")
  );
  const [unlockOpen, setUnlockOpen] = useState(false);

  useEffect(() => {
    const accountConfigure = () => {
      setAccount(stores.accountStore.getStore("account"));
      closeUnlock();
    };
    const connectWallet = () => {
      onAddressClicked();
    };

    stores.emitter.on(ACTIONS.ACCOUNT_CONFIGURED, accountConfigure);
    stores.emitter.on(ACTIONS.CONNECT_WALLET, connectWallet);
    return () => {
      stores.emitter.removeListener(
        ACTIONS.ACCOUNT_CONFIGURED,
        accountConfigure
      );
      stores.emitter.removeListener(ACTIONS.CONNECT_WALLET, connectWallet);
    };
  }, []);

  const onAddressClicked = () => {
    setUnlockOpen(true);
  };

  const closeUnlock = () => {
    setUnlockOpen(false);
  };

  return (
    <div className="relative mt-0 flex h-full w-full flex-col pt-8 sm:pt-20 lg:pt-28">
      <BotComponent />
    </div>
  );
}

export default Bot;
