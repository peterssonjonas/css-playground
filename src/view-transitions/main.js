// Make sure browser has support
;(() => {
  let shouldThrow = false

  if (!window.navigation) {
    document.querySelector('[data-reason="navigation-api"]').style.display =
      'block'
    shouldThrow = true
  }

  if (!document.startViewTransition) {
    document.querySelector(
      '[data-reason="same-document-view-transitions"]'
    ).style.display = 'block'
    shouldThrow = true
  }

  if (!('CSSViewTransitionRule' in window)) {
    document.querySelector(
      '[data-reason="cross-document-view-transitions"]'
    ).style.display = 'block'
    shouldThrow = true
  }

  if (shouldThrow) {
    // Throwing here, to prevent the rest of the code from getting executed
    // If only JS (in the browser) had something like process.exit().
    throw new Error('Browser is lacking support …')
  }
})()

const ENABLE_JS_VIEW_TRANSITIONS = false
const ENABLE_DIRECTION_AWARE_VIEW_TRANSITIONS = false

if (ENABLE_JS_VIEW_TRANSITIONS) {
  window.addEventListener('pageswap', onPageSwap)
  window.addEventListener('pagereveal', onPageReveal)
}

async function onPageSwap(e) {
  if (!e.viewTransition) return
  const currentUrl = e.activation.from?.url
    ? new URL(e.activation.from.url)
    : null
  const targetUrl = new URL(e.activation.entry.url)
  if (isGoingFromArticlePageToHomeOrListPage(currentUrl, targetUrl)) {
    setTemporaryViewTransitionNames(
      [
        [document.querySelector(`#article-page .image`), 'image'],
        [document.querySelector(`#article-page h1`), 'title'],
        [document.querySelector(`#article-page .preamble`), 'desc'],
      ],
      e.viewTransition.finished
    )
  }

  if (isGoingFromHomeOrListPageToArticlePage(currentUrl, targetUrl)) {
    const articleSlug = extractSlugFromUrl(targetUrl)
    setTemporaryViewTransitionNames(
      [
        [document.querySelector(`#${articleSlug} .image`), 'image'],
        [document.querySelector(`#${articleSlug} h2 a`), 'title'],
        [document.querySelector(`#${articleSlug} p`), 'desc'],
      ],
      e.viewTransition.finished
    )
  }

  if (isGoingBetweenHomeAndListPage(currentUrl, targetUrl)) {
    setTemporaryViewTransitionNamesToFirstTwoArticles(e.viewTransition.finished)
  }
}

async function onPageReveal(e) {
  if (!navigation.activation.from) return
  if (!e.viewTransition) return

  const fromUrl = new URL(navigation.activation.from.url)
  const currentUrl = new URL(navigation.activation.entry.url)

  if (isGoingFromArticlePageToHomeOrListPage(fromUrl, currentUrl)) {
    const articleSlug = extractSlugFromUrl(fromUrl)

    setTemporaryViewTransitionNames(
      [
        [document.querySelector(`#${articleSlug} .image`), 'image'],
        [document.querySelector(`#${articleSlug} h2 a`), 'title'],
        [document.querySelector(`#${articleSlug} p`), 'desc'],
      ],
      e.viewTransition.ready
    )
  }

  if (isGoingFromHomeOrListPageToArticlePage(fromUrl, currentUrl)) {
    setTemporaryViewTransitionNames(
      [
        [document.querySelector(`#article-page .image`), 'image'],
        [document.querySelector(`#article-page h1`), 'title'],
        [document.querySelector(`#article-page .preamble`), 'desc'],
      ],
      e.viewTransition.ready
    )
  }

  if (isGoingBetweenHomeAndListPage(fromUrl, currentUrl)) {
    setTemporaryViewTransitionNamesToFirstTwoArticles(e.viewTransition.finished)
  }

  if (ENABLE_DIRECTION_AWARE_VIEW_TRANSITIONS) {
    setTemporaryViewTransitionDirection(
      fromUrl,
      currentUrl,
      e.viewTransition.finished
    )
  }
}

function isHomePage(url) {
  const path = url.pathname.split('/').pop()
  return path === '' || path === 'index.html'
}

function isArticlesListPage(url) {
  const path = url.pathname.split('/').pop()
  return path === 'articles.html'
}

function isArticlePage(url) {
  const path = url.pathname.split('/').pop()

  if (path === 'articles.html') return false
  return url.pathname.split('/').pop().startsWith('article')
}

function isGoingFromArticlePageToHomeOrListPage(prevUrl, nextUrl) {
  return (
    isArticlePage(prevUrl) &&
    (isHomePage(nextUrl) || isArticlesListPage(nextUrl))
  )
}

function isGoingBetweenHomeAndListPage(prevUrl, nextUrl) {
  return (
    (isHomePage(prevUrl) && isArticlesListPage(nextUrl)) ||
    (isArticlesListPage(prevUrl) && isHomePage(nextUrl))
  )
}

function isGoingFromHomeOrListPageToArticlePage(prevUrl, nextUrl) {
  return (
    (isHomePage(prevUrl) || isArticlesListPage(prevUrl)) &&
    isArticlePage(nextUrl)
  )
}

function extractSlugFromUrl(url) {
  return url.pathname.split('/').pop().split('.').shift()
}

async function setTemporaryViewTransitionNames(entries, vtPromise) {
  for (const [$el, name] of entries) {
    $el.style.viewTransitionName = name
  }

  await vtPromise

  for (const [$el, name] of entries) {
    $el.style.viewTransitionName = ''
  }
}

async function setTemporaryViewTransitionDirection(
  fromUrl,
  currentUrl,
  vtPromise
) {
  document.documentElement.dataset.direction = getDirection(fromUrl, currentUrl)

  await vtPromise

  delete document.documentElement.dataset.direction
}

async function setTemporaryViewTransitionNamesToFirstTwoArticles(vtPromise) {
  setTemporaryViewTransitionNames(
    [
      [document.querySelector(`#article1 .image`), 'image1'],
      [document.querySelector(`#article1 h2 a`), 'title1'],
      [document.querySelector(`#article1 p`), 'desc1'],
      [document.querySelector(`#article2 .image`), 'image2'],
      [document.querySelector(`#article2 h2 a`), 'title2'],
      [document.querySelector(`#article2 p`), 'desc2'],
    ],
    vtPromise
  )
}

const pages = ['', 'index', 'about', 'articles', 'article1', 'article2']
function getDirection(fromUrl, currentUrl) {
  const fromIndex = pages.indexOf(extractSlugFromUrl(fromUrl))
  const currentIndex = pages.indexOf(extractSlugFromUrl(currentUrl))

  if (currentIndex === -1) {
    return 'forwards'
  }

  return fromIndex < currentIndex ? 'forwards' : 'backwards'
}
