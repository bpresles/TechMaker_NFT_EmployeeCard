import type { Web3Provider } from "@ethersproject/providers";
import { useWeb3React } from "@web3-react/core";
import { UserRejectedRequestError } from "@web3-react/injected-connector";
import { useState } from "react";
import EmployeeCardFactory from "../contracts/EmployeeCardFactory.json"
import useEmployeeCardBalance from "../hooks/useEmployeeCardBalance";
import useEmployeeCardContract from "../hooks/useEmployeeCardContract";
import useMetaMaskOnboarding from "../hooks/useMetaMaskOnboarding";
import { parseBalance } from "../util";
import Image from "next/image";
import ipfs from "./Ipfs";
import Script from "next/script";

const MintEmployeeCard = () => {


    const { active, error, activate, chainId, account, setError } =
        useWeb3React();
    const { contract, mintEmployeeCard } = useEmployeeCardContract();

    const {
        isMetaMaskInstalled,
        isWeb3Available,
    } = useMetaMaskOnboarding();

    const {data} = useEmployeeCardBalance(account);
    const balance = data ?? 0;

    // manage minting state
    const [minting, setMinting] = useState(false);

    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [birthDate, setBirthDate] = useState('');
    const [startDate, setStartDate] = useState('');
    const [picture, setPicture] = useState('');
    const [wallet, setWallet] = useState('');

    const handleFirstNameChange = (event) => {
        setFirstName(event.target.value);
    };
    const handleLastNameChange = (event) => {
        setLastName(event.target.value);
    };
    const handleBirthDateChange = (event) => {
        setBirthDate(event.target.value);
    };
    const handleStartDateChange = (event) => {
        setStartDate(event.target.value);
    };
    const handlePictureChange = (event) => {
        setPictureBase64(event.target.files[0]);
    };
    const handleWalletAddress = (event) => {
        setWallet(event.target.value);
    }

    const validateFormAndMint = (event) => {
        event.preventDefault();
        
        const dateFormatRegex = /^[0-9]{2}\/[0-9]{2}\/[0-9]{4}$/;
        if (!birthDate.match(dateFormatRegex)) {
            alert("Invalid birth date");
            return false;
        }
        if (!startDate.match(dateFormatRegex)) {
            alert("Invalid start date");
            return false;
        }

        if (!firstName || firstName.length == 0) {
            alert("Firstname is mandatory");
            return false;
        }

        if (!lastName || lastName.length == 0) {
            alert("Lastname is mandatory");
            return false;
        }

        if (!picture) {
            alert("You must upload a picture");
        }

        generatePdfCard(firstName, lastName, birthDate, startDate, picture);
    };

    const setPictureBase64 = (file) => {
        let reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = function () {
            setPicture(reader.result as string);
        };
        reader.onerror = function (error) {
            console.log('Error: ', error);
        };
    };

    const generatePdfCard = async (fname: string, lname: string, bdate: string, sdate: string, pict: string) => {
        document.getElementById('employeePicture').setAttribute('src', 'data:image/*;' + pict);
        document.getElementById('employeeFirstname').innerHTML = fname;
        document.getElementById('employeeLastname').innerHTML = lname;
        document.getElementById('employeeBirthdate').innerHTML = bdate;
        document.getElementById('employeeStartdate').innerHTML = sdate;

        const element = document.getElementById('cardPdf');
        
        html2pdf().from(element).toImg().outputImg('dataurl').then((cardBase64) => {
            console.log(cardBase64);
            document.getElementById('generatedCard').setAttribute('src', cardBase64);
            generateNFTMetadataAndUploadToIpfs(cardBase64, firstName, lastName, birthDate, startDate);
        });
    };
    
    const generateNFTMetadataAndUploadToIpfs = (pdfBase64: string, fname: string, lname: string, bdate: string, sdate: string) => {
        const NFTMetaData = {
            "description": "Younup Employee Card", 
            "external_url": "https://www.younup.fr", 
            "image": pdfBase64, 
            "name": "Younup",
            "attributes": {
                "firstName": fname,
                "lastName": lname,
                "birthDate": bdate,
                "startDate": sdate,
            }
        };

        const splittedSDate: Array<string> = sdate.split('/');
        const dDateObj: Date = new Date(parseInt(splittedSDate[2]), parseInt(splittedSDate[1]) - 1, parseInt(splittedSDate[0]));

        const metadataString = JSON.stringify(NFTMetaData);
        let ifpsBuffer = Buffer.from(metadataString);
        ipfs.add([ifpsBuffer], {pin:true})
                .then(response => {
                    console.log('ipfs://' + response.cid);
                    mintEmployeeCard(wallet, 'ipfs://' + response.cid, dDateObj.getTime());
                }).catch((err) => {
                    console.log(err);
                });
    }

    return (
        <div>
            {isWeb3Available ? (
                <div>
                    <Script src="/js/html2pdf.bundle.min.js"></Script>
                    <form method="post" id="mintForm" encType="multipart/form-data" onSubmit={validateFormAndMint}>
                        <div>
                            <label htmlFor="ethaddress">Employee Ethereum wallet address:</label>
                            <input type="text" name="ethaddress" onChange={handleWalletAddress}></input>
                        </div>
                        <div>
                            <label htmlFor="firstname">Firstname:</label>
                            <input type="text" name="firstname" onChange={handleFirstNameChange}></input>
                        </div>
                        <div>
                            <label htmlFor="lastname">Lastname:</label>
                            <input type="text" name="lastname" onChange={handleLastNameChange}></input>
                        </div>
                        <div>
                            <label htmlFor="birthdate">Birth date:</label>
                            <input type="text" name="birthdate" onChange={handleBirthDateChange}></input>
                        </div>
                        <div>
                            <label htmlFor="startdate">Start date in the company:</label>
                            <input type="text" name="startdate" onChange={handleStartDateChange}></input>
                        </div>
                        <div>
                            <label htmlFor="picture">Photo:</label>
                            <input type="file" name="picture" accept="image/*" onChange={handlePictureChange}></input>
                        </div>
                        <div>
                            <button type="submit" disabled={minting}>
                                Mint your employee card
                            </button>
                        </div>
                    </form>
                    <div>
                        <img id="generatedCard"></img>
                    </div>
                    <div id="cardPdf">
                        <div className="companyLogo">
                            <img src="/logo.jpg" alt="Younup" />
                        </div>
                        <div className="employeePicture">
                            <div className="picture">
                                <img src="" alt="picture" id="employeePicture" />
                            </div>
                            <div className="employeeCardDetails">
                                <p id="employeeFirstname"></p>
                                <p id="employeeLastname"></p>
                                <p id="employeeBirthdate"></p>
                                <p id="employeeStartdate"></p>
                            </div>
                        </div>
                    </div>
                </div>
            ) : (
                <p>{isMetaMaskInstalled ? "Connect to MetaMask first" : "Connect to your Wallet first"}</p>
            )}
            <style jsx>{`
                #generatedCard {
                    display: none;
                }
                #cardPdf {
                    display: block;
                    position: relative;
                    width: 500px;
                    height: 200px;
                    margin: auto;
                    text-align: left;
                }
                #cardPdf .companyLogo > img {
                    position: absolute;
                    top: 20px;
                    left: 30px; 
                    width: 60px;
                    height: 60px;
                }
                #cardPdf .employeePicture {
                    float: none;
                    clear: both;
                    padding: 50px 0 0 90px;
                }
                #cardPdf .employeePicture .picture {
                    float: left;
                }
                #cardPdf .employeePicture .picture > img {
                    width: 100px;
                    height: 100px;
                }
                #cardPdf .employeeCardDetails {
                    float: left;
                    margin-left: 20px;
                }
            `}</style>
        </div>
    );
};

export default MintEmployeeCard;