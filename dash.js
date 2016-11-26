/**
 * GitHub commit dashboard v0.1
 * Created by Tibor Szász
 * License: MIT style
 * 
 * Please note that:
 *
 * "For unauthenticated requests, the rate limit allows you to make up to 60 requests per hour. 
 *  Unauthenticated requests are associated with your IP address, and not the user making requests."
 *
 * https://developer.github.com/v3/#rate-limiting
 */

class Dashboard {

	constructor( organization ) {
		this.today = new Date().getDate()
		this.uniqueUsers = [] // [{userData},{userData}...]
		this.organization = organization.substr(1)
		this.baseUrl = 'https://api.github.com/orgs/'

		if( this.organization == '' ) {
			this.displayMenu()

			window.addEventListener("hashchange", function (e) {
				this.organization = window.location.hash.substr(1)
				this.fetchCommits().then( this.renderUsers.bind(this) )
				this.hideMenu()
			}.bind(this))
		} else {
			this.fetchCommits().then( this.renderUsers.bind(this) )
		}
	}

	fetchCommits() {
		let url = this.baseUrl + this.organization + '/events'
		//let url = 'mock.json' // <-- use this for development
		let mainRequest = fetch( url, { method: 'get' })
			.then( response => response.json() )
			.catch( err => { console.log("Error is",err) });

		return mainRequest.then( json => {
			//console.log(json)
			var x = 0
			json.forEach( item => {
				var userData = { count: 1 }
				var d = new Date( item.created_at);
				if( this.today == d.getDate() ) {
					userData.name = item.actor.login
					userData.image = item.actor.avatar_url
					userData.commit = item.payload.commits[0].message

					var index = this.uniqueUsers.findIndex( x => x.name == userData.name )
					if( index == -1 ) {
						this.uniqueUsers.push(userData)
					} else {
						this.uniqueUsers[index]['count']++
					}
				}
			})
			this.uniqueUsers.sort( (a,b) => b.count - a.count )
		})
	}

	renderUsers() {
		if( this.uniqueUsers.length == 0 ) {
			let message = document.createElement('div')
			message.innerHTML = '<iframe width="560" height="315" src="https://www.youtube.com/embed/dQw4w9WgXcQ?autoplay=1" frameborder="0" allowfullscreen></iframe>'
			document.getElementById('results').appendChild( message )
			return
		}

		this.uniqueUsers.forEach( el => {
			let wrapper = document.createElement('article')
			let label = document.createElement('div')
			label.innerHTML = el.count

			let img = document.createElement('img')
			img.src = el.image + "size=120"

			wrapper.appendChild( img )
			wrapper.appendChild( label )

			document.getElementById('results').appendChild( wrapper )
		})
	}

	displayMenu() {
		document.querySelector('nav').style.display = 'block'
	}

	hideMenu() {
		document.querySelector('nav').style.display = 'none'
	}
}

new Dashboard( window.location.hash )
