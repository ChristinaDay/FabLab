// Usage: node scripts/search-cache-check.mjs "query=welder" "location=San Francisco"
import http from 'node:http'

function buildPath(args) {
	const params = new URLSearchParams()
	for (const a of args) {
		const [k, v] = String(a).split('=')
		if (k && v !== undefined) params.set(k, v)
	}
	return `/api/debug/search-check?${params.toString()}`
}

function requestOnce(host, path) {
	return new Promise((resolve, reject) => {
		const started = Date.now()
		const req = http.request({ host, path, method: 'GET' }, (res) => {
			let data = ''
			res.on('data', (chunk) => (data += chunk))
			res.on('end', () => {
				const duration = Date.now() - started
				try {
					const json = JSON.parse(data)
					resolve({ status: res.statusCode, duration, body: json })
				} catch (e) {
					resolve({ status: res.statusCode, duration, body: { raw: data } })
				}
			})
		})
		req.on('error', reject)
		req.end()
	})
}

async function main() {
	const host = process.env.HOST || 'localhost:3000'
	const path = buildPath(process.argv.slice(2))
	console.log(`GET http://${host}${path}`)
	const first = await requestOnce(host, path)
	console.log('First:', first.body)
	const second = await requestOnce(host, path)
	console.log('Second:', second.body)
}

main().catch((e) => {
	console.error(e)
	process.exit(1)
})
