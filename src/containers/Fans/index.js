import './index.styl';
import React from 'react';
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import Stats from "three/examples/jsm/libs/stats.module";
import Text from '@/assets/utils/Text';
import Confetti from '@/assets/utils/Confetti';

const textureLoader = new THREE.TextureLoader();

export default class Fans extends React.Component {
  constructor() {
    super();
    this.width = window.innerWidth;
    this.height = window.innerHeight;
    this.sceneGroup = new THREE.Group();
    this.mousePosition = new THREE.Vector2(
      window.innerWidth / 2,
      window.innerHeight / 2
    );
    this.lerpedMouse2d = {
      previous: new THREE.Vector2(),
      current: new THREE.Vector2(),
      amount: 0.05,
    };
    this.lerpedMouse3d = {
      previous: new THREE.Vector2(0, -10, 0),
      current: new THREE.Vector2(),
      amount: 0.065,
    };
    this.ticker = 0;
    this.matcaps = {
      logoMatcap: textureLoader.load(require('@/containers/Fans/images/matcap_0.png')),
      textMatcap1: textureLoader.load(require('@/containers/Fans/images/matcap_5.png')),
      textMatcap2: textureLoader.load(require('@/containers/Fans/images/matcap_6.png')),
    }
  }

  state = {
    loadingProcess: 0,
    sceneReady: false
  }

  componentDidMount() {
    this.initThree();
  }

  componentWillUnmount() {
    this.setState = () => {
      return;
    }
  }

  initThree = () => {
    const sizes = {
      width: window.innerWidth,
      height: window.innerHeight
    }

    const renderer = new THREE.WebGLRenderer({
      canvas: document.querySelector('canvas.webgl'),
      antialias: true,
      alpha: true
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(sizes.width, sizes.height);
    renderer.toneMapping = THREE.LinearToneMapping;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.needsUpdate = true;
    this.renderer = renderer;

    const scene = new THREE.Scene();
    this.scene = scene;
    const camera = new THREE.PerspectiveCamera(55, sizes.width / sizes.height, 1, 1000);
    camera.position.set(0, 0, 560);
    this.camera = camera;

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;

    const stats = new Stats();
    document.documentElement.appendChild(stats.dom);

    const logo = new THREE.Group();
    logo.position.set(0, 0, 0);
    logo.scale.set(11, 11, 11);
    logo.rotateY(Math.PI * 0.2);
    logo.rotateZ(Math.PI * 0.1);

    const light = new THREE.DirectionalLight(0xffffff, 1.2);
    light.intensity = 1;
    light.position.set(0, 20, 30);
    light.castShadow = true;
    light.target = logo;
    light.shadow.mapSize.width = 512 * 12;
    light.shadow.mapSize.height = 512 * 12;
    light.shadow.camera.top = 80;
    light.shadow.camera.bottom = -80;
    light.shadow.camera.left = -80;
    light.shadow.camera.right = 80;
    scene.add(light);

    const ambientLight = new THREE.AmbientLight(0xffffff);
    ambientLight.intensity = .8;
    scene.add(ambientLight);

    const material = new THREE.MeshMatcapMaterial({
      matcap: this.matcaps.logoMatcap,
      side: THREE.DoubleSide,
    })

    const geometry1 = new THREE.ConeGeometry(4, 4, 4);
    const cone = new THREE.Mesh( geometry1, material );

    logo.add(cone)

    const geometry2 = new THREE.CylinderGeometry(6, 10, 4, 4, 1);
    const cylinder = new THREE.Mesh( geometry2, material );
    cylinder.position.y = -6
    logo.add( cylinder );

    const geometry3 = new THREE.CylinderGeometry(12, 16, 4, 4, 1);
    const cylinder3 = new THREE.Mesh( geometry3, material );
    cylinder3.position.y = -12
    logo.add( cylinder3 );

    scene.add(logo);
    const axis = new THREE.Vector3(0, 1, 0)
    const animate = () => {
      requestAnimationFrame(animate);
      stats && stats.update();
      controls && controls.update();
      logo && logo.rotateOnAxis(axis, Math.PI / 400);
      renderer.render(scene, camera);
    }
    animate();

    // 添加纸屑礼花效果
    this.confetti = new Confetti({
			parent: this.sceneGroup,
			points: [
				new THREE.Vector3(-300, 300, 100),
				new THREE.Vector3(0, 300, 100),
				new THREE.Vector3(300, 300, 100),
			],
			firstPopDuration: 3.5,
		});

    // 添加文字
    this.textGroup = new THREE.Group();

		const DEFAULTS = {
			parent: this.textGroup,
			initializeDelay: 3,
		};

		new Text({
			...DEFAULTS,
			text: '1000!',
			position: new THREE.Vector3(120, 160, -80),
			textOptions: {
				size: 110,
				spacing: 120
			},
			material: {
        matcap: this.matcaps.textMatcap1
			},
			animation: 'zoomAndFlip',
			onLoad: () => {
				this.confetti.pop(2);
			},
		});
		new Text({
			...DEFAULTS,
			text: 'THANK YOU',
			position: new THREE.Vector3(-120, -10, -80),
			textOptions: {
				size: 60,
				spacing: 100,
			},
			material: {
        matcap: this.matcaps.textMatcap2,
        opacity: .75
			},
			animation: 'upDownFlip',
		});

		this.sceneGroup.add(this.textGroup);

    // initEvents
    const handlePointerMove = (e) => {
			e.preventDefault();
			this.mousePosition.x = e.clientX;
			this.mousePosition.y = e.clientY;
		};

		const handlePointerDown = (e) => {
			e.preventDefault();
			this.confetti && this.confetti.pop();
		};

		window.addEventListener('pointermove', handlePointerMove);
		window.addEventListener('pointerdown', handlePointerDown);
		window.addEventListener('resize', () => {
      this.width = window.innerWidth;
			this.height = window.innerHeight;
			this.camera.aspect = this.width / this.height;
			this.camera.updateProjectionMatrix();
			this.renderer.setPixelRatio(window.devicePixelRatio);
			this.renderer.setSize(this.width, this.height);
    }, { passive: true });

    this.scene.add(this.sceneGroup);
  }

  render () {
    return (
      <div className='fans_page'>
        <canvas className='webgl'></canvas>
        {this.state.loadingProcess === 100 ? '' : (
          <div className='loading'>
            <span className='progress'>{this.state.loadingProcess} %</span>
          </div>
        )}
        <a className='github' href='https://github.com/dragonir/3d' target='_blank' rel='noreferrer'>
          <svg height='36' aria-hidden='true' viewBox='0 0 16 16' version='1.1' width='36' data-view-component='true'>
            <path fill='#FFFFFF' fillRule="evenodd" d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"></path>
          </svg>
          <span className='author'>@dragonir</span>
        </a>
      </div>
    )
  }
}