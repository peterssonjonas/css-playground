// Make sure browser has support
;(() => {
  let shouldThrow = false

  if (!window.navigation) {
    document.querySelector('[data-reason="navigation-api"]').style.display =
      'block'
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

const enableJsViewTransitions = true

if (enableJsViewTransitions) {
  window.addEventListener('pageswap', onPageSwap)
  window.addEventListener('pagereveal', onPageReveal)
}

function onPageSwap(e) {
  if (!e.viewTransition) return

  const currentUrl = e.activation.from?.url
    ? new URL(e.activation.from.url)
    : null
  const targetUrl = new URL(e.activation.entry.url)

  // Going from article page to homepage
  if (isArticlePage(currentUrl) && isHomePage(targetUrl)) {
    setTemporaryViewTransitionNames(
      [
        [document.querySelector(`#article-page .image`), 'image'],
        [document.querySelector(`#article-page h1`), 'title'],
        [document.querySelector(`#article-page .preamble`), 'desc'],
      ],
      e.viewTransition.finished
    )
  }

  // Going to article page
  if (isArticlePage(targetUrl)) {
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
}

function onPageReveal(e) {
  if (!navigation.activation.from) return
  if (!e.viewTransition) return

  const fromUrl = new URL(navigation.activation.from.url)
  const currentUrl = new URL(navigation.activation.entry.url)

  // Went from article page to homepage
  if (isArticlePage(fromUrl) && isHomePage(currentUrl)) {
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

  // Went to article page
  if (isArticlePage(currentUrl)) {
    setTemporaryViewTransitionNames(
      [
        [document.querySelector(`#article-page .image`), 'image'],
        [document.querySelector(`#article-page h1`), 'title'],
        [document.querySelector(`#article-page .preamble`), 'desc'],
      ],
      e.viewTransition.ready
    )
  }
}

function isHomePage(url) {
  const path = url.pathname.split('/').pop()
  return path === '' || path === 'index.html'
}

function isArticlePage(url) {
  return url.pathname.split('/').pop().startsWith('article')
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
