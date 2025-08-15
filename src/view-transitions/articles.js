const template = document.querySelector('#article-template')
const wrapper = document.querySelector('.articles')
const filterWrapper = document.querySelector('.filters')

const categories = ['all', 'sport', 'nöje', 'ekonomi', 'inrikes', 'utrikes']

addFilterButtonsToDOM()
addArticlesToDOM()

function addFilterButtonsToDOM() {
  categories.forEach((category) => {
    const button = document.createElement('button')
    button.textContent = category
    button.dataset.filter = category
    button.classList.add('filter-btn')
    if (category === 'all') button.classList.add('active')
    addEventListenerToFilterButton(button)
    filterWrapper.appendChild(button)
  })
}

function addEventListenerToFilterButton(button) {
  button.addEventListener('click', (e) => {
    const filter = e.target.getAttribute('data-filter')

    if (!document.startViewTransition) {
      updateActiveButton(e.target)
      filterArticles(filter)
      return
    }

    document.startViewTransition(() => {
      updateActiveButton(e.target)
      filterArticles(filter)
    })
  })
}

function addArticlesToDOM() {
  const articles = [
    {
      title: 'Lorem, ipsum dolor',
      preamble:
        'Lorem ipsum dolor sit, amet consectetur adipisicing elit.Praesentium, amet!',
      link: 'article1.html',
      color: 'orange',
      category: 'inrikes',
    },
    {
      title: 'Aperiam, obcaecati voluptas?',
      preamble:
        'Dolorum eveniet officia dolores pariatur dolore blanditiis delectus dolor et.',
      link: 'article2.html',
      color: 'rebeccapurple',
      category: 'nöje',
    },
    {
      title: 'Error, pariatur unde.',
      preamble:
        'Molestiae magni rem eos tempora excepturi alias quod debitis corporis.',
      link: '#',
      color: '',
      category: 'sport',
    },
    {
      title: 'Eum, quidem fugit.',
      preamble:
        'Ipsa qui ratione, quo incidunt consequatur earum. Accusamus, molestiae dolores!',
      link: '#',
      color: '',
      category: 'sport',
    },
    {
      title: 'Modi, facere repellendus!',
      preamble: 'Cum soluta maiores omnis debitis ad cumque velit modi illum.',
      link: '#',
      color: '',
      category: 'ekonomi',
    },
    {
      title: 'Recusandae, sapiente neque?',
      preamble:
        'Eos, architecto itaque. Libero ullam, esse ea voluptas repudiandae ad.',
      link: '#',
      color: '',
      category: 'utrikes',
    },
    {
      title: 'Ipsam, quam. Neque.',
      preamble:
        'Aliquid dolore provident magnam fuga quo, ad odio commodi incidunt!',
      link: '#',
      color: '',
      category: 'sport',
    },
    {
      title: 'Natus, quaerat distinctio.',
      preamble:
        'Molestias quam, adipisci quidem quo autem numquam non animi provident?',
      link: '#',
      color: '',
      category: 'inrikes',
    },
    {
      title: 'Quam, fuga illo?',
      preamble:
        'Voluptas harum ut voluptates velit, esse accusantium. Provident, sit. Fugit.',
      link: '#',
      color: '',
      category: 'nöje',
    },
    {
      title: 'Enim, autem itaque.',
      preamble:
        'Autem illo saepe alias odit dolores unde quisquam modi recusandae.',
      link: '#',
      color: '',
      category: 'ekonomi',
    },
  ]

  articles.forEach((article, i) => {
    const articleElem = template.content.cloneNode(true)

    const card = articleElem.querySelector('.card')
    card.id = `article${i + 1}`
    card.dataset.category = article.category
    card.style.viewTransitionName = `article${i + 1}`

    const image = articleElem.querySelector('.image')
    image.style.setProperty('--color', article.color)

    const category = articleElem.querySelector('.category')
    category.textContent = article.category

    const categoryHue =
      categories.indexOf(article.category) * (360 / (categories.length - 1))
    category.style.setProperty('--color', `hsl(${categoryHue}, 50%, 80%)`)

    const link = articleElem.querySelector('a')
    link.href = article.link
    link.textContent = article.title

    const preamble = articleElem.querySelector('p')
    preamble.textContent = article.preamble

    wrapper.appendChild(articleElem)
  })
}

function updateActiveButton(newButton) {
  filterWrapper.querySelector('.active').classList.remove('active')
  newButton.classList.add('active')
}

function filterArticles(category) {
  const articles = wrapper.querySelectorAll('.card')

  articles.forEach((article) => {
    const articleCategory = article.getAttribute('data-category')

    if (category === 'all' || category === articleCategory) {
      article.removeAttribute('hidden')
    } else {
      article.setAttribute('hidden', '')
    }
  })
}
