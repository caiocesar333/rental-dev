import React, { useEffect, useState } from "react";
import Container from "react-bootstrap/Container";
import Nav from "react-bootstrap/Nav";
import Navbar from "react-bootstrap/Navbar";
import { Button, Badge } from "react-bootstrap";
import logo from "../../images/logo/logo.png";
import "bootstrap/dist/css/bootstrap.min.css";
import "./navbar.css";

function NavBar() {
  const [address, setAddress] = useState("");
  const [balanceEth, setBalanceEth] = useState("");
  const [error, setError] = useState("");

  const hasProvider = () => typeof window !== "undefined" && window.ethereum;

  const toEth = (weiHex) => {
    try {
      const wei = BigInt(weiHex);
      const ethInt = wei / 10n ** 18n;
      const ethFrac = (wei % 10n ** 18n).toString().padStart(18, "0").slice(0, 6);
      return `${ethInt}.${ethFrac}`;
    } catch {
      return "";
    }
  };

  const fetchBalance = async (addr) => {
    try {
      const bal = await window.ethereum.request({
        method: "eth_getBalance",
        params: [addr, "latest"],
      });
      setBalanceEth(toEth(bal));
    } catch (e) {
      setError(e?.message || "Failed to fetch balance");
    }
  };

  const connect = async () => {
    setError("");
    if (!hasProvider()) {
      setError("No Ethereum provider found. Please install MetaMask.");
      return;
    }
    try {
      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      });
      const addr = accounts?.[0] || "";
      setAddress(addr);
      if (addr) await fetchBalance(addr);
    } catch (e) {
      setError(e?.message || "User rejected the connection request");
    }
  };

  const disconnect = () => {
    setAddress("");
    setBalanceEth("");
    setError("");
  };

  useEffect(() => {
    if (!hasProvider()) return;

    const handleAccountsChanged = (accs) => {
      if (accs?.length) {
        setAddress(accs[0]);
        fetchBalance(accs[0]);
      } else {
        disconnect();
      }
    };

    const handleChainChanged = () => {
      if (address) fetchBalance(address);
    };

    window.ethereum.on?.("accountsChanged", handleAccountsChanged);
    window.ethereum.on?.("chainChanged", handleChainChanged);

    return () => {
      window.ethereum.removeListener?.("accountsChanged", handleAccountsChanged);
      window.ethereum.removeListener?.("chainChanged", handleChainChanged);
    };
  }, [address]);

  const short = (addr) => (addr ? `${addr.slice(0, 6)}...${addr.slice(-4)}` : "");

  return (
    <Navbar expand="lg" className="py-3">
      <Container>
        <Navbar.Brand href="#" className="me-lg-5">
          <img className="logo" src={logo} alt="logo" />
        </Navbar.Brand>

        <Navbar.Toggle aria-controls="navbarScroll" />
        <Navbar.Collapse id="navbarScroll">
          <Nav className="me-auto my-2 my-lg-0" navbarScroll>
            <Nav.Link href="#action1">Marketplace</Nav.Link>
            <Nav.Link href="#action2" className="px-lg-3">
              About Us
            </Nav.Link>
            <Nav.Link href="#action3">Developers</Nav.Link>
          </Nav>
        </Navbar.Collapse>

        <div className="d-flex align-items-center order">
          <span className="line d-lg-inline-block d-none"></span>
          <i className="fa-regular fa-heart"></i>

          {/* Botão de conexão / sessão */}
          {!address ? (
            <Button
              onClick={connect}
              variant="primary"
              className="btn-primary d-none d-lg-inline-block ms-3"
            >
              Connect Wallet
            </Button>
          ) : (
            <div className="d-flex align-items-center ms-3">
              <Button variant="outline-primary" className="d-none d-lg-inline-block me-2" disabled>
                {short(address)}
              </Button>
              {balanceEth && (
                <Badge bg="secondary" className="me-2">
                  {balanceEth} ETH
                </Badge>
              )}
              <Button variant="outline-danger" onClick={disconnect}>
                Disconnect
              </Button>
            </div>
          )}
        </div>
      </Container>

      {error && (
        <div className="w-100 text-center text-danger mt-2" style={{ fontSize: 12 }}>
          {error}
        </div>
      )}
    </Navbar>
  );
}

export default NavBar;
