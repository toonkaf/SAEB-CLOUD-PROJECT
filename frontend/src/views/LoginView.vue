<script setup>
</script>

<template>
    <div class="login-page">
        <h1>Login</h1>
        <div class="login-hero">
            <h3>Username :</h3>
            <textarea></textarea>
            <h3>Password :</h3>
            <textarea></textarea>
            <br>
            <button>Login</button>
        </div>
    </div>
</template>

<style scoped>
.login-page{
   /* width: 80vw; */
    height: 86vh;
    /* background-color: aliceblue; */
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;

}

.login-hero{
    padding: 1vw ;
    border: 0.5rem solid black;
}

</style>