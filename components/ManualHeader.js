import { useMoralis } from 'react-moralis'
import { useEffect, useState } from 'react'

export default function ManualHeader() {
	const { enableWeb3, account, isWeb3Enabled, Moralis, deactivateWeb3, isWeb3EnableLoading } =
		useMoralis() // Moralis provider needed in _app.js, works on MM

	useEffect(() => {
		if (isWeb3Enabled) return
		if (typeof window !== 'undefined') {
			if (window.localStorage.getItem('connected')) {
				enableWeb3()
			}
		}
	}, [isWeb3Enabled])
	// careful for circular renders (if we don't pass a dep array)

	useEffect(() => {
		Moralis.onAccountChanged((account) => {
			console.log(`Account changed to ${account}!`)
			if (account == null) {
				window.localStorage.removeItem('connected')
				deactivateWeb3()
				console.log('Null account found.')
			}
		})
	}, [])

	return (
		<div>
			{account ? (
				<div>
					Connected to {account.slice(0, 6)}...{account.slice(account.length - 4)}
				</div>
			) : (
				<button
					onClick={async () => {
						await enableWeb3()
						if (typeof window !== 'undefined') {
							window.localStorage.setItem('connected', 'injected')
						}
					}}
					disabled={isWeb3EnableLoading}
				>
					Connect
				</button>
			)}
		</div>
	)
}
