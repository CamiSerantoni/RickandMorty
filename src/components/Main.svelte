

<!-- Main.svelte -->

<style>
  .Main {
    grid-template-columns: minmax(auto, 936px);
    justify-content: center;
    background-color: #fafafa;
  }
  .Main-container {
    background: rgb(36, 40, 47);
    display: grid;
    grid-template-columns: 0fr 0fr;
    padding: 4.5rem 0px;
    padding-left: 5%;
  }
</style>

<div class="Main">
  <div class="Main-container">
    <slot/>
  </div>
  </div>