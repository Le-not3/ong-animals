// Pequena app sem backend — usa localStorage para persistir usuários e posts

const qs = s => document.querySelector(s)
const qsa = s => document.querySelectorAll(s)

/* --- Elementos --- */
const btnShowRegister = qs('#btn-show-register')
const btnShowLogin = qs('#btn-show-login')
const btnShowCreate = qs('#btn-show-create')
const btnLogout = qs('#btn-logout')
const btnHome = qs('#btn-home')

const registerCard = qs('#register-card')
const loginCard = qs('#login-card')
const createPostCard = qs('#create-post-card')

const registerForm = qs('#register-form')
const loginForm = qs('#login-form')
const createPostForm = qs('#create-post-form')

const postsList = qs('#posts-list')

/* --- Storage keys --- */
const KEY_USERS = 'onganimal_users_v1'
const KEY_POSTS = 'onganimal_posts_v1'
const KEY_SESSION = 'onganimal_session_v1'

/* --- Util --- */
function readJSON(key){ try { return JSON.parse(localStorage.getItem(key)) || [] } catch(e){ return [] } }
function writeJSON(key, val){ localStorage.setItem(key, JSON.stringify(val)) }

/* --- Inicialização --- */
function init(){
	renderPosts()
	updateAuthUI()
}

/* --- Autenticação simples --- */
function getSession(){ return JSON.parse(localStorage.getItem(KEY_SESSION) || 'null') }
function setSession(user){ localStorage.setItem(KEY_SESSION, JSON.stringify(user)) }
function clearSession(){ localStorage.removeItem(KEY_SESSION) }

function updateAuthUI(){
	const me = getSession()
	if(me){
		registerCard.classList.add('hidden')
		loginCard.classList.add('hidden')
		btnShowCreate.classList.remove('hidden')
		btnLogout.classList.remove('hidden')
	} else {
		registerCard.classList.remove('hidden')
		loginCard.classList.remove('hidden')
		createPostCard.classList.add('hidden')
		btnShowCreate.classList.add('hidden')
		btnLogout.classList.add('hidden')
	}
}

/* --- Registro --- */
registerForm.addEventListener('submit', e => {
	e.preventDefault()
	const name = qs('#reg-name').value.trim()
	const email = qs('#reg-email').value.trim().toLowerCase()
	const password = qs('#reg-password').value

	const users = readJSON(KEY_USERS)
	if(users.find(u => u.email === email)){
		alert('E-mail já cadastrado.'); return
	}
	const user = { id: Date.now(), name, email, password }
	users.push(user)
	writeJSON(KEY_USERS, users)
	setSession({ id: user.id, name: user.name, email: user.email })
	registerForm.reset()
	updateAuthUI()
	alert('Conta criada! Você agora está logado.')
})

/* --- Login --- */
loginForm.addEventListener('submit', e => {
	e.preventDefault()
	const email = qs('#login-email').value.trim().toLowerCase()
	const password = qs('#login-password').value
	const users = readJSON(KEY_USERS)
	const user = users.find(u => u.email === email && u.password === password)
	if(!user){ alert('Credenciais inválidas'); return }
	setSession({ id: user.id, name: user.name, email: user.email })
	loginForm.reset()
	updateAuthUI()
	alert('Bem-vindo, ' + user.name)
})

/* --- Logout / Navegação --- */
btnLogout.addEventListener('click', () => { clearSession(); updateAuthUI(); renderPosts() })
btnShowCreate.addEventListener('click', () => { createPostCard.classList.toggle('hidden') })
btnShowRegister.addEventListener('click', () => { registerCard.classList.remove('hidden'); loginCard.classList.add('hidden') })
btnShowLogin.addEventListener('click', () => { loginCard.classList.remove('hidden'); registerCard.classList.add('hidden') })
btnHome.addEventListener('click', () => { window.scrollTo({ top: 0, behavior: 'smooth' }) })

/* --- Posts --- */
createPostForm.addEventListener('submit', e => {
	e.preventDefault()
	const title = qs('#post-title').value.trim()
	const body = qs('#post-body').value.trim()
	const location = qs('#post-location').value.trim()
	const image = qs('#post-image').value.trim()
	const me = getSession()
	if(!me){ alert('Você precisa estar logado para criar um post.'); return }

	const posts = readJSON(KEY_POSTS)
	const post = {
		id: Date.now(),
		title, body, location, image, author: { id: me.id, name: me.name }, createdAt: new Date().toISOString()
	}
	posts.unshift(post)
	writeJSON(KEY_POSTS, posts)
	createPostForm.reset()
	createPostCard.classList.add('hidden')
	renderPosts()
})

function renderPosts(){
	const posts = readJSON(KEY_POSTS)
	postsList.innerHTML = ''
	if(posts.length === 0){ postsList.innerHTML = '<p class="muted">Nenhum caso publicado ainda.</p>'; return }
	for(const p of posts){
		const el = document.createElement('div')
		el.className = 'post'
		el.innerHTML = `
			<div class="meta">
				<h4>${escapeHtml(p.title)}</h4>
				<div class="muted">Por ${escapeHtml(p.author.name)} • ${timeAgo(p.createdAt)}${p.location ? ' • ' + escapeHtml(p.location) : ''}</div>
				<p>${escapeHtml(p.body)}</p>
			</div>
			${p.image ? `<img src="${escapeHtml(p.image)}" alt="imagem"/>` : ''}
		`
		postsList.appendChild(el)
	}
}

/* --- Pequenas utilidades --- */
function escapeHtml(s){ if(!s) return ''; return s.replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;') }

function timeAgo(iso){
	const d = new Date(iso); const diff = Math.floor((Date.now()-d.getTime())/1000)
	if(diff < 60) return `${diff}s atrás`
	if(diff < 3600) return `${Math.floor(diff/60)}m atrás`
	if(diff < 86400) return `${Math.floor(diff/3600)}h atrás`
	return `${Math.floor(diff/86400)}d atrás`
}

/* iniciar */
init()

