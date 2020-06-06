import React, { ChangeEvent, FormEvent, useEffect, useState } from 'react';
import { Link, useHistory } from 'react-router-dom';
import { FiArrowLeft } from 'react-icons/fi';
import { Marker, Map, TileLayer } from 'react-leaflet';
import { LeafletMouseEvent } from 'leaflet';
import axios from 'axios';
import api from '../../services/api';

import './styles.css';
import logo from '../../assets/logo.svg'

interface Item {
  id: number;
  title: string;
  image_url: string;
}

interface IBGEUFResponse {
  sigla: string;
}

interface IBGECityResponse {
  nome: string;
}

const CreatePoint = () => {
  const [items, setItems] = useState<Item[]>([]);
  const [UFs, setUFs] = useState<string[]>([]);
  const [cities, setCities] = useState<string[]>([]);
  const [inputData, setInputData] = useState({ email: '', name: '' });
  const [initalPosition, setInitialPositon] = useState<[number, number]>([-27.2092052, -49.6401092]);
  const [selectedUF, setSelectedUF] = useState('0');
  const [selectedCity, setSelectedCity] = useState('0');
  const [selectedPosition, setSelectedPosition] = useState<[number, number]>([-27.2092052, -49.6401092]);
  const [selectedItems, setSelectedItems] = useState<number[]>([]);

  const history = useHistory();

  const handleSelectedUF = (event: ChangeEvent<HTMLSelectElement>) => {
    setSelectedUF(event.target.value);
  };

  const handleSelectedCity = (event: ChangeEvent<HTMLSelectElement>) => {
    setSelectedCity(event.target.value);
  };

  const handleMapClick = (event: LeafletMouseEvent) => {
    setSelectedPosition([
      event.latlng.lat,
      event.latlng.lng,
    ]);
  };

  const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;

    setInputData({
      ...inputData,
      [name]: value,
    });
  };

  const handleSelectedItem = (id: number) => {
    let items = [...selectedItems, id];

    if (selectedItems.some((i) => i === id)) {
      items = selectedItems.filter((i) => i !== id);
    }

    setSelectedItems(items);
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();

    const [latitude, longitude] = selectedPosition;
    const { email, name } = inputData;

    await api.post('points', {
      name,
      email,
      city: selectedCity,
      uf: selectedUF,
      latitude,
      longitude,
      items: selectedItems,
    });

    alert('Ponto de coleta criado');

    history.push('/');
  };

  useEffect(() => {
    navigator.geolocation.getCurrentPosition((pos) => {
      const { latitude, longitude } = pos.coords;
      setInitialPositon([latitude, longitude]);
    });
  }, []);

  useEffect(() => {
    api.get('items').then((res) => {
      setItems(res.data);
    });
  }, []);

  useEffect(() => {
    axios.get<IBGEUFResponse[]>('https://servicodados.ibge.gov.br/api/v1/localidades/estados/').then((res) => {
      const ufInitials = res.data.map((uf) => uf.sigla).sort();
      setUFs(ufInitials);
    });
  }, []);

  useEffect(() => {
    if (selectedUF !== '0') {
      axios
        .get<IBGECityResponse[]>(`https://servicodados.ibge.gov.br/api/v1/localidades/estados/${selectedUF}/municipios`)
        .then((res) => {
          const cityNames = res.data.map((city) => city.nome).sort();
          setCities(cityNames);
        });
    }
  }, [selectedUF]);

  return (
    <div id="page-create-point">
      <header>
        <img src={logo} alt="Ecoleta" />

        <Link to="/">
          <FiArrowLeft />
          Voltar para home
        </Link>
      </header>

      <form onSubmit={handleSubmit}>
        <h1>Cadastro do <br /> ponto de coleta</h1>

        <fieldset>
          <legend>
            <h2>Dados</h2>
          </legend>

          <div className="field">
            <label htmlFor="name">Nome da entidade</label>
            <input
              type="text"
              name="name"
              id="name"
              onChange={handleInputChange}
            />
          </div>

          <div className="field">
            <label htmlFor="email">E-mail</label>
            <input
              type="email"
              name="email"
              id="email"
              onChange={handleInputChange}
            />
          </div>
        </fieldset>

        <fieldset>
          <legend>
            <h2>Endereço</h2>
            <span>Selecione o endereço no mapa</span>
          </legend>

          <Map center={initalPosition} zoom={15} onClick={handleMapClick}>
            <TileLayer
              attribution='&amp;copy <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            <Marker position={selectedPosition} />
          </Map>

          <div className="field-group">
            <div className="field">
              <label htmlFor="uf">Estado (UF)</label>
              <select
                name="uf"
                id="uf"
                value={selectedUF}
                onChange={handleSelectedUF}
              >
                <option value="0">Selecione uma UF</option>
                {UFs.map((uf) => (
                  <option key={uf} value={uf}>{uf}</option>
                ))}
              </select>
            </div>
            <div className="field">
              <label htmlFor="city">Cidade</label>
              <select
               name="city"
               id="city"
               value={selectedCity}
               onChange={handleSelectedCity}
              >
                <option value="0">Selecione uma Cidade</option>
                {cities.map((city) => (
                  <option key={city} value={city}>{city}</option>
                ))}
              </select>
            </div>
          </div>
        </fieldset>

        <fieldset>
          <legend>
            <h2>Ítens de Coleta</h2>
            <span>Selecione um ou mais ítens abaixo</span>
          </legend>

          <ul className="items-grid">
            {items.map((i) => (
              <li
                key={i.id}
                onClick={() => handleSelectedItem(i.id)}
                className={selectedItems.includes(i.id) ? 'selected' : ''}
              >
                <img src={i.image_url} alt={i.title} />
                <span>{i.title}</span>
              </li>
            ))}
          </ul>
        </fieldset>

        <button type="submit">Cadastrar ponto de coleta</button>
      </form>
    </div>
  )
};

export default CreatePoint;
