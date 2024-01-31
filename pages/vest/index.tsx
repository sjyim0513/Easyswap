import { useState, useEffect } from "react";
import { useRouter } from "next/router";

import VestsNFTs from "../../components/ssVests/ssVests";

import { ACTIONS } from "../../stores/constants/constants";
import stores from "../../stores";

function Vesting({ changeTheme }) {
  const accountStore = stores.accountStore.getStore("account");
  const router = useRouter();
  const [account, setAccount] = useState(accountStore);
  const [unlockOpen, setUnlockOpen] = useState(false);

  useEffect(() => {
    const accountConfigure = () => {
      const accountStore = stores.accountStore.getStore("account");
      setAccount(accountStore);
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
    <div className="relative mt-0 flex h-full w-full flex-col pt-20 lg:pt-28">
      <div>
        <VestsNFTs />
      </div>
    </div>
  );
}

export default Vesting;
