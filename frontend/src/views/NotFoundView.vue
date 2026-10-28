<template>
    <div class="not-found">
        <h1>404 - ไม่พบหน้านี้</h1>
        <RouterLink to="/" aria-label="Go back home" class="Back">
        --> Go back to homepage <--
        </RouterLink>
    </div>
</template>

<style scoped>

.not-found{
    height: 84vh;
    display: flex;
    flex-direction: column;
    align-items: center;
    /* justify-content: center; */
    flex-wrap: wrap;
    list-style: none;
}

.Back{
    display: block;
    text-align: center;
    width: 60%;
    height: 48px;
    /* border: none; */
    cursor: pointer;
    color: black;
    text-decoration: none;
}
</style>