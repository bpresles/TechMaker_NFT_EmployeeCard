import { useState } from "react";
import useEmployeeCardContract from "../hooks/useEmployeeCardContract";
import useMetaMaskOnboarding from "../hooks/useMetaMaskOnboarding";
import ipfs from "./Ipfs";
import Script from "next/script";
import TokenBalance from "./TokenBalance";
import { formatUnits } from "@ethersproject/units";
import { ContractTransaction, ContractReceipt } from "ethers";
import html2pdf from '../node_modules/html2pdf.js/src/index';

const MintEmployeeCard = () => {

    const { contract, mintEmployeeCard } = useEmployeeCardContract();

    const {
        isMetaMaskInstalled,
        isWeb3Available,
    } = useMetaMaskOnboarding();

    // manage minting state
    const [minting, setMinting] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [successMessage, setSuccessMessage] = useState('');

    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [birthDate, setBirthDate] = useState('');
    const [startDate, setStartDate] = useState('');
    const [picture, setPicture] = useState('');
    const [file, setFile] = useState(null);
    const [wallet, setWallet] = useState('');
    const [walletBalance, setWalletBalance] = useState(0);
    const [transaction, setTransaction] = useState(null);

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
        setErrorMessage('');
        setWalletBalance(0);
        if (event.target.value != '' && event.target.value.match(/(\b0x[a-fA-F0-9]{40}\b)/g)) {
            setWallet(event.target.value);

            contract.balanceOf(event.target.value).then((balance) => {
                const userBalance = parseFloat(formatUnits(balance, 18));
                setWalletBalance(userBalance);

                if (userBalance > 0) {
                    setErrorMessage('An employee can only have 1 card.');
                }
                else {
                    setErrorMessage('');
                }
            })
            .catch((err: Error) => {
                console.log(err.message);
                setWalletBalance(0);
            });
        }
    }

    const validateFormAndMint = (event) => {
        event.preventDefault();
        setMinting(false);
        setErrorMessage('');
        
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

        generateImageCard(firstName, lastName, birthDate, startDate, picture);
    };

    const setPictureBase64 = (file) => {
        setFile(file);

        let reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = function () {
            setPicture(reader.result as string);
        };
        reader.onerror = function (error) {
            console.log('Error: ', error);
        };
    };
    
    const dataUrlToFile = async (src) => {
        return (fetch(src)
            .then(function(res) {
                return res.arrayBuffer();
            }))
            .then(function(buf) {
                return new File([buf], 'card.jpg', {type:'image/*'});
            })
    };

    const generateImageCard = async (fname: string, lname: string, bdate: string, sdate: string, pict: string) => {
        document.getElementById('employeePicture').setAttribute('src', 'data:image/*;' + pict);
        document.getElementById('employeeFirstname').innerHTML = fname;
        document.getElementById('employeeLastname').innerHTML = lname;
        document.getElementById('employeeBirthdate').innerHTML = bdate;
        document.getElementById('employeeStartdate').innerHTML = sdate;

        const element = document.getElementById('cardPdf');
        
        html2pdf().from(element).toImg().outputImg('dataurl').then((cardBase64) => {            
            dataUrlToFile(cardBase64)
            .then((cardFile) => {
                ipfs.add(cardFile, {pin:true})
                .then(response => {
                    const imageUri = `ipfs://${response.cid}`;
                    console.log('ipfs://' + response.cid);

                    generateNFTMetadataAndUploadToIpfs(imageUri, fname, lname, bdate, sdate);
                }).catch((err: Error) => {
                    console.log(err.message);
                    setErrorMessage(`IPFS: ${err.message}`);

                    setMinting(false);
                });
            });
        });
    };
    
    const generateNFTMetadataAndUploadToIpfs = (imageUri: string, fname: string, lname: string, bdate: string, sdate: string) => {
        const NFTMetaData = {
            "description": "Younup Employee Card", 
            "external_url": "https://www.younup.fr", 
            "image": imageUri, 
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
                    setMinting(true);
                    
                    mintEmployeeCard(wallet, 'ipfs://' + response.cid, dDateObj.getTime()/1000)
                    .then((response: ContractTransaction) => {
                        setErrorMessage('');
                        setSuccessMessage(`Minting in progress, transaction number: Transaction number: ${response.hash}`);

                        response.wait(2).then((response: ContractReceipt) => {
                            console.log(response.status);
                            setSuccessMessage(`Minting finished ! :)`);
                        });
                    })
                    .catch ((mintErr: Error) => {
                        console.log(mintErr.message);
                        setErrorMessage(`Minting: ${mintErr.message}`);
    
                        setMinting(false);
                    });

                    setMinting(false);
                }).catch((err: Error) => {
                    console.log(err.message);
                    setErrorMessage(`IPFS: ${err.message}`);

                    setMinting(false);
                });
    }

    return (
        <div>
            {isWeb3Available ? (
                <div>
                    <p>Contract address: {contract.address}</p>
                    <TokenBalance account={wallet} />
                    <br/>
                    <div className="success_message">{successMessage}</div>
                    <div className="error_message">{errorMessage}</div>
                    <br/>
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
                            <button type="submit" disabled={minting/* || walletBalance > 0*/}>
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
                .error_message {
                    color: red;
                    font-weight: bold;
                }
                .success_message {
                    color: green;
                    font-weight: bold;
                }
            `}</style>
        </div>
    );
};

export default MintEmployeeCard;
