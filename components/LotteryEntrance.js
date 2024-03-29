// Have a function to call the lottery
import { useWeb3Contract } from 'react-moralis'
import { abi, contractAddresses } from '../constants'
import { useMoralis } from 'react-moralis'
import { useEffect, useState } from 'react'
import { ethers } from 'ethers'
import { useNotification } from 'web3uikit'

export default function LotteryEntrance() {
	const { chainId: chainIdHex, isWeb3Enabled } = useMoralis() // Moralis knows because header passes all the info from MM to the moralis provider, which passes them to the components
	const chainId = parseInt(chainIdHex)
	const raffleAddress = chainId in contractAddresses ? contractAddresses[chainId][0] : null

	const [entranceFee, setEntranceFee] = useState('0')
	const [numPlayers, setNumPlayers] = useState('0')
	const [recentWinner, setRecentWinner] = useState('0')

	const dispatch = useNotification()

	const {
		runContractFunction: enterRaffle,
		isLoading,
		isFetching,
	} = useWeb3Contract({
		abi: abi,
		contractAddress: raffleAddress,
		functionName: 'enterRaffle',
		params: {},
		msgValue: entranceFee,
	})

	const { runContractFunction: getEntranceFee } = useWeb3Contract({
		abi: abi,
		contractAddress: raffleAddress,
		functionName: 'getEntranceFee',
		params: {},
	})

	const { runContractFunction: getNumberOfPlayers } = useWeb3Contract({
		abi: abi,
		contractAddress: raffleAddress,
		functionName: 'getNumberOfPlayers',
		params: {},
	})

	const { runContractFunction: getRecentWinner } = useWeb3Contract({
		abi: abi,
		contractAddress: raffleAddress,
		functionName: 'getRecentWinner',
		params: {},
	})

	useEffect(() => {
		if (isWeb3Enabled) {
			updateUI()
		}
	}, [isWeb3Enabled])

	async function updateUI() {
		const entranceFeeFromCall = (await getEntranceFee()).toString()
		const numPlayersFromCall = (await getNumberOfPlayers()).toString()
		const recentWinnerFromCall = (await getRecentWinner()).toString()
		setEntranceFee(entranceFeeFromCall)
		setNumPlayers(numPlayersFromCall)
		setRecentWinner(recentWinnerFromCall)
	}

	const handleSuccess = async function (tx) {
		await tx.wait(1)
		handleNewNotification(tx)
		updateUI()
	}

	const handleNewNotification = function () {
		dispatch({
			type: 'info',
			message: 'Transaction completed!',
			title: 'Tx Notification',
			position: 'topR',
		})
	}

	return (
		<div className="p-5">
			Hello from lottery entrance!
			{raffleAddress ? (
				<div>
					<button
						className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded ml-auto"
						onClick={async function () {
							await enterRaffle({
								onSuccess: handleSuccess,
								onError: (e) => console.log(e),
							})
						}}
						disabled={isLoading || isFetching}
					>
						{isLoading || isFetching ? (
							<div className="animate-spin spinner-border h-8 w-8 border-b-2 rounded-full"></div>
						) : (
							<div>Enter Raffle</div>
						)}
					</button>
					<div>Entrance Fee: {ethers.utils.formatUnits(entranceFee, 'ether')} ETH</div>
					<div>Players: {numPlayers}</div>
					<div>Recent winner: {recentWinner}</div>
				</div>
			) : (
				<div>No Raffle address detected, try and switch network!</div>
			)}
		</div>
	)
}
