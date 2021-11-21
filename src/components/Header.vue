<template>
  <header class="air-header">
    <div class="air-logo">
      <img
        src="assets/logo.png"
      />
    </div>
    <div class="air-title">
      <p>Система мониторинга воздуха</p>
      <p>Красноярский научный центр СО РАН</p>
    </div>
    <ul class="air-links air-links-main">
      <li><a sec="table" href="index.html">Таблица</a></li>
      <li><a sec="map" href="map.html">Карта</a></li>
      <li><a sec="week" href="week.html" class="airActiveButton">7 дней</a></li>
      <li><a sec="data" href="data.html">Данные</a></li>
      <li><a sec="help" href="help.html">?</a></li>
    </ul>
    <ul class="air-links air-links-sec">
      <li id="air-login" style="">
        <a><img src="assets/person-24px.svg" /></a>
      </li>
      <li id="air-logout" style="display: none">
        <a>User</a>
      </li>
    </ul>
  </header>
</template>

<script>
export default {};
</script>

<style>
/* body{
  font-family: 'Times New Roman', Times, serif !important;
} */

*,
*:before,
*:after {
  -webkit-box-sizing: border-box;
  -moz-box-sizing: border-box;
  box-sizing: border-box;
  padding: 0;
  margin: 0;
  font-family: Arial, Helvetica, sans-serif;
}

html {
  box-sizing: border-box;
  font-family: Arial, Helvetica, sans-serif;
  font-size: 18px;
  font-weight: 400;
  color: #212529;
  text-align: left;
}

button {
  border: none;
  outline: none;
  background: none;
  cursor: pointer;
}

.air-header {
  border-bottom: 5px solid #055a81;
  display: -webkit-flex;
  display: -ms-flex;
  display: flex;

  flex-wrap: nowrap;

  align-items: center;
  line-height: 1.15;
  grid-area: header;
}

.air-title {
  color: #055a81;
  margin: 0 15px;
  font-size: 1.2rem;
}

.air-title p {
  text-align: left;
  font-weight: bold;
  margin-top: 0;
  margin-bottom: 0;
}

.air-title p:last-child {
  font-size: 0.9rem;
}

.air-header ul {
  margin-bottom: 0;
}

.air-links li a {
  -webkit-transition: all 0.2s ease-in-out;
  -moz-transition: all 0.2s ease-in-out;
  transition: all 0.2s ease-in-out;
  white-space: pre;
}

.air-links {
  display: -webkit-flex;
  display: -ms-flex;
  display: flex;
  flex-direction: row;

  list-style: none;
  text-transform: uppercase;
}

.air-logo img {
  width: 70px;
  height: 70px;
  float: left;
  margin-left: 2px;
}
.air-links-main {
  flex-grow: 1;
}

#air-login a {
  padding: 13px 16px;
}

.air-links a {
  display: block;
  padding: 22px;
  margin: 0;
  color: #222222;
  font-size: 1rem;
  letter-spacing: 1px;
  line-height: 1.5;
  font-weight: bold;
  text-decoration: none;
  text-transform: uppercase;
  cursor: pointer;
}

.air-links a:hover {
  background-color: #eeeeee;
  color: #000000;
  text-decoration: none;
}

.air-links .airInactiveButton {
  cursor: auto;
  color: #cccccc;
}

a.airActiveButton {
  color: #ffffff;
  background-color: #055a81;
}

a.airActiveButton:hover {
  color: #ffffff;
  background-color: #055a81;
}
a.airInactiveButton:hover {
  color: #cccccc;
}

@media screen and (max-width: 1440px) {
}

@media screen and (max-width: 1024px) {
  .air-title {
    display: none;
  }
}

@media screen and (max-width: 768px) {
  .air-links a {
    font-size: 0.7rem;
    padding: 16px;
  }

  #air-login {
    padding: -4px;
  }

  .air-logo img {
    width: 50px;
    height: 50px;
  }
}

@media screen and (max-width: 440px) {
  .air-links-sec {
    display: none;
  }
}

@media screen and (max-width: 50px) {
  .air-header {
    -webkit-flex-direction: column;
    -ms-flex-direction: column;
    flex-direction: column;
  }
  .air-logo img {
    width: 103px;
    height: 103px;
  }

  .air-links {
    -webkit-flex-direction: column;
    -ms-flex-direction: column;
    flex-direction: column;

    width: 100%;
    text-align: center;
  }
}

#air-login-password {
  margin-top: 16px;
}

#air-login-error {
  margin-top: 16px;
}
</style>