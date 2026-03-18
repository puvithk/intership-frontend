const list = document.querySelectorAll('.community-li');

list.forEach(item => {
    item.addEventListener('click', () => {

        list.forEach(li => li.classList.remove('active'));

        item.classList.add('active');
    })
})