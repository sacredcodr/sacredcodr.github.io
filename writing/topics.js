const filters = document.querySelector('.topic-filters');
const buttons = [...filters.querySelectorAll('button')];
const entries = [...document.querySelectorAll('.writing-entry')];
const status = document.querySelector('.filter-status');

function showTopic(topic)
{
    const selected = buttons.find(button => button.dataset.topic === topic) || buttons[0];
    let visibleCount = 0;

    for (const entry of entries)
    {
        const matches = selected.dataset.topic === 'all' || entry.dataset.tags.split(' ').includes(selected.dataset.topic);
        entry.hidden = !matches;
        visibleCount += Number(matches);
    }

    for (const button of buttons)
    {
        button.setAttribute('aria-pressed', String(button === selected));
    }

    status.textContent = `${visibleCount} ${visibleCount === 1 ? 'note' : 'notes'}`;
}

for (const button of buttons)
{
    const count = button.dataset.topic === 'all'
        ? entries.length
        : entries.filter(entry => entry.dataset.tags.split(' ').includes(button.dataset.topic)).length;
    button.querySelector('span').textContent = count;

    button.addEventListener('click', () =>
    {
        const url = new URL(location.href);
        if (button.dataset.topic === 'all')
        {
            url.searchParams.delete('tag');
        }
        else
        {
            url.searchParams.set('tag', button.dataset.topic);
        }
        history.pushState(null, '', url);
        showTopic(button.dataset.topic);
    });
}

window.addEventListener('popstate', () => showTopic(new URLSearchParams(location.search).get('tag')));
showTopic(new URLSearchParams(location.search).get('tag'));
filters.hidden = false;
