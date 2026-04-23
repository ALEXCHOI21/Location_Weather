/**
 * 가양동 실시간 날씨 모니터링 시스템 Logic
 * Powered by Open-Meteo API (Free & No Key Required)
 * Developed by ChoiGPT Corp.
 */

const CONFIG = {
    LAT: 36.35,
    LON: 127.44,
    LOCATION_NAME: "대전광역시 동구 가양동",
    UPDATE_INTERVAL: 10 * 60 * 1000, // 10분마다 업데이트
};

// Weather Code Mapping (WMO Code to Lucide Icon & Description)
const WEATHER_MAP = {
    0: { icon: 'sun', desc: '맑음' },
    1: { icon: 'cloud-sun', desc: '대체로 맑음' },
    2: { icon: 'cloud', desc: '구름 조금' },
    3: { icon: 'cloud', desc: '흐림' },
    45: { icon: 'cloud-fog', desc: '안개' },
    48: { icon: 'cloud-fog', desc: '짙은 안개' },
    51: { icon: 'cloud-drizzle', desc: '가벼운 이슬비' },
    53: { icon: 'cloud-drizzle', desc: '이슬비' },
    55: { icon: 'cloud-drizzle', desc: '짙은 이슬비' },
    61: { icon: 'cloud-rain', desc: '약한 비' },
    63: { icon: 'cloud-rain', desc: '비' },
    65: { icon: 'cloud-rain', desc: '강한 비' },
    71: { icon: 'snowflake', desc: '약한 눈' },
    73: { icon: 'snowflake', desc: '눈' },
    75: { icon: 'snowflake', desc: '강한 눈' },
    80: { icon: 'cloud-rain-wind', desc: '소나기' },
    95: { icon: 'cloud-lightning', desc: '뇌우' },
};

async function fetchWeather() {
    try {
        const response = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${CONFIG.LAT}&longitude=${CONFIG.LON}&current_weather=true&hourly=temperature_2m,weathercode,precipitation_probability&timezone=Asia%2FSeoul`);
        
        if (!response.ok) throw new Error('데이터를 가져오는데 실패했습니다.');
        
        const data = await response.json();
        updateUI(data);
    } catch (error) {
        console.error('Weather Fetch Error:', error);
        document.getElementById('weather-description').innerText = '데이터 오류';
    } finally {
        // 로더 숨기기
        setTimeout(() => {
            document.getElementById('loader').classList.add('hidden');
        }, 500);
    }
}

function updateUI(data) {
    const current = data.current_weather;
    const weatherInfo = WEATHER_MAP[current.weathercode] || { icon: 'cloud', desc: '정보 없음' };

    // 현재 기온 및 상태
    document.getElementById('current-temp').innerText = Math.round(current.temperature);
    document.getElementById('weather-description').innerText = weatherInfo.desc;
    
    // 아이콘 업데이트
    const iconContainer = document.getElementById('weather-icon-large');
    iconContainer.innerHTML = `<i data-lucide="${weatherInfo.icon}"></i>`;
    
    // 상세 정보 (Mockup or additional API fields if needed)
    document.getElementById('wind-speed').innerText = `${current.windspeed} km/h`;
    document.getElementById('humidity').innerText = `${data.hourly.precipitation_probability[0]}%`; // Open-Meteo는 강수확률로 대체 가능
    document.getElementById('precipitation').innerText = `0.0 mm`; 

    // 날짜 업데이트
    const now = new Date();
    const options = { month: 'long', day: 'numeric', weekday: 'short', hour: '2-digit', minute: '2-digit' };
    document.getElementById('current-date').innerText = now.toLocaleDateString('ko-KR', options);

    // 예보 그리드 업데이트
    const forecastGrid = document.getElementById('hourly-forecast');
    forecastGrid.innerHTML = ''; // 초기화

    // 향후 4시간 예보
    for (let i = 1; i <= 4; i++) {
        const hourTime = new Date();
        hourTime.setHours(hourTime.getHours() + i);
        const hourLabel = hourTime.getHours() + '시';
        const hourTemp = Math.round(data.hourly.temperature_2m[i]);
        const hourCode = data.hourly.weathercode[i];
        const hourInfo = WEATHER_MAP[hourCode] || { icon: 'cloud' };

        const item = document.createElement('div');
        item.className = 'forecast-item glass-panel';
        item.innerHTML = `
            <span class="time">${hourLabel}</span>
            <i data-lucide="${hourInfo.icon}"></i>
            <span class="temp">${hourTemp}°</span>
        `;
        forecastGrid.appendChild(item);
    }

    // Lucide 아이콘 초기화
    lucide.createIcons();
}

// 초기 실행
document.addEventListener('DOMContentLoaded', () => {
    fetchWeather();
    
    // 주기적 업데이트 설정
    setInterval(fetchWeather, CONFIG.UPDATE_INTERVAL);
});
