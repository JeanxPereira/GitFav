import { GithubUser } from "./githubUser.js"

//classe que vai conter a lógica dos dados
//como os dados serão estruturados
export class Favorites {
  constructor(root) {
    this.root = document.querySelector(root)
    this.tbody = this.root.querySelector('table tbody')
    this.load()
  }

  load() {
    this.entries = JSON.parse(localStorage.getItem('@github-favorites:')) || []
  }

  save() {
    localStorage.setItem('@github-favorites:', JSON.stringify(this.entries))
  }

  async add(username) {
    try{
      const userExists = this.entries.find(entry => entry.login === username)
      if(userExists) {
        throw new Error(`${username} já cadastrado.`)
      }

      const user = await GithubUser.search(username)
      if(user.login == undefined) {
        throw new Error(`User ${username} not found! (404)`)
      }

      this.entries = [user, ...this.entries]
      this.update()
      this.save()

    } catch(error) {
      alert(error.message)
    }
  }

  delete(user) {
    const filteredEntries = this.entries
    .filter(entry => entry.login !== user.login)

    this.entries = filteredEntries
    this.update()
    this.save()
  }

  emptyState() {
    const emptyStateTable = document.getElementById('tableState')
    const emptyStateText = document.getElementById('emptyStateText')

    if (this.entries.length === 0) {
      emptyStateTable.classList.add('emptyState');
      emptyStateText.classList.remove('disable');
    } else {
      emptyStateTable.classList.remove('emptyState');
      emptyStateText.classList.add('disable');
    }
  }
}

//classe que vai criar visualização e eventos do HTML
export class FavoritesView extends Favorites {
  constructor(root) {
    super(root)

    this.update()
    this.onAdd()
    this.emptyState()
  }

  onAdd() {
    const addButton = this.root.querySelector('.search button')
    addButton.onclick = () => {
      const { value } = this.root.querySelector('.search input')
      this.add(value)
    }
  }

  update() {
    this.removeAllTr()
    this.emptyState()

    this.entries.forEach( user => {
      const row = this.createRow()
      row.querySelector('.user img').src = `https://github.com/${user.login}.png`
      row.querySelector('.user a').href = `https://github.com/${user.login}`
      row.querySelector('.user img').alt = `Imagem de ${user.name}`
      row.querySelector('.user p').textContent = user.name
      row.querySelector('.user span').textContent = `/${user.login}`
      row.querySelector('.repos').textContent = user.public_repos
      row.querySelector('.followers').textContent = user.followers

      row.querySelector('.remove').onclick = () => {
        const isOk = confirm('Tem certeza que deseja deletar essa linha?')
        if(isOk) {
          this.delete(user)
        }
      }
    
      this.tbody.append(row)
    })
  }
  
  createRow() {
    const tr = document.createElement('tr')

    tr.innerHTML = `
      <td class="user">
        <img>
        <a href="" target="_blank">
          <p></p>
          <span></span>
        </a>
      </td>

      <td class="repos"></td>

      <td class="followers"></td>

      <td>
        <button class="remove">Remover</button>
      </td>
    `

    return tr
  }

  removeAllTr() {
    this.tbody.querySelectorAll('tr')
    .forEach((tr) => {
      tr.remove()
    })
  }
}