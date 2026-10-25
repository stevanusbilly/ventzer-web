import React, { useState, useEffect, useRef } from "react";
import { useParams } from 'react-router-dom';
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Button } from "primereact/button";
import { Toast } from "primereact/toast";
import { Checkbox } from "primereact/checkbox";
import { ConfirmDialog, confirmDialog } from "primereact/confirmdialog";
import { eventService } from "../../services/eventService";
import { weddingService } from "../../services/weddingService";
import { eventPhotoService } from "../../services/eventPhotoService";
import { eventLocationService } from "../../services/eventLocationService";
import { giftService } from "../../services/giftService";
import { guestMessageService } from "../../services/guestMessageService";
import EventForm from "./EventForm";
import { Event, EventLocation, EventPhoto, Gift, GuestMessage, Wedding } from "../../types";
import { useAuth } from "../../contexts/AuthContext";
import moment from "moment";
// import htmlString from "./bronze.html";

const arrDay : string[] = [ "Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu" ];
const arrMonth : string[] = [ "Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember" ];

const EventList: React.FC = () => {
	const [events, setEvents] = useState<Event | null>(null);
	const [wedding, setWedding] = useState<Wedding | null>(null);
	const [eventPhotoGallery, setEventPhotoGallery] = useState<EventPhoto[] | null>([]);
	const [eventPhotoQuote, setEventPhotoQuote] = useState<EventPhoto | null>(null);
	const [eventPhotoProfilBride, setEventPhotoProfilBride] = useState<EventPhoto | null>(null);
	const [eventPhotoProfilGroom, setEventPhotoProfilGroom] = useState<EventPhoto | null>(null);
	const [eventPhotoSaveTheDate, setEventPhotoSaveTheDate] = useState<EventPhoto | null>(null);
	const [eventPhotoAkhir, setEventPhotoAkhir] = useState<EventPhoto | null>(null);
	const [eventPhotoCover, setEventPhotoCover] = useState<EventPhoto | null>(null);
	const [eventPhotoOpening, setEventPhotoOpening] = useState<EventPhoto | null>(null);
	const [eventPhotoBackground, setEventPhotoBackground] = useState<EventPhoto | null>(null);
	const [eventLocation, setEventLocation] = useState<EventLocation[]>([]);
	const [gift, setGift] = useState<Gift[]>([]);
	const [guestMessage, setGuestMessage] = useState<GuestMessage[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const { user } = useAuth();
    const { id } = useParams(); 
    const toast = useRef<Toast>(null);
    const [srcTemplate, setSrcTemplate] = useState<string | undefined>(undefined);
    const iframeRef = useRef<HTMLIFrameElement>(null);

    useEffect(() => {
        getEvents();
    }, []);

    useEffect(() => {
        getDataWedding()
    }, [events])

    const getEvents = async (): Promise<void> => {
        try {
            const response = await eventService.getById(Number(id));
            setEvents(response);
		} catch (error: any) {
            setLoading(false);
        }
    };

    const getDataWedding = async (): Promise<void> => {
        try {
            const responseWedding = await weddingService.getByEvent(Number(id));
            setWedding(responseWedding);
            const responseLocation = await eventLocationService.getByEvent(Number(id));
            setEventLocation(responseLocation);

            const responsePhotoQuote = await eventPhotoService.getQuoteByEvent(Number(id));
            setEventPhotoQuote(responsePhotoQuote);
            const responsePhotoProfilBride = await eventPhotoService.getProfilBrideByEvent(Number(id));
            setEventPhotoProfilBride(responsePhotoProfilBride);
            const responsePhotoProfilGroom = await eventPhotoService.getProfilGroomByEvent(Number(id));
            setEventPhotoProfilGroom(responsePhotoProfilGroom);
            const responsePhotoSaveTheDate = await eventPhotoService.getSaveTheDateByEvent(Number(id));
            setEventPhotoSaveTheDate(responsePhotoSaveTheDate);
            const responsePhotoAkhir = await eventPhotoService.getFotoAkhirByEvent(Number(id));
            setEventPhotoAkhir(responsePhotoAkhir);
            const responsePhotoBackground = await eventPhotoService.getBackgroundByEvent(Number(id));
            setEventPhotoBackground(responsePhotoBackground);
            const responsePhotoCover = await eventPhotoService.getCoverByEvent(Number(id));
            setEventPhotoCover(responsePhotoCover);
            const responsePhotoOpening = await eventPhotoService.getOpeningByEvent(Number(id));
            setEventPhotoOpening(responsePhotoOpening);
            const responsePhotoGallery = await eventPhotoService.listGalleryByEvent(Number(id));
            setEventPhotoGallery(responsePhotoGallery);

            const responseGift = await giftService.getByEvent(Number(id));
            setGift(responseGift);
            const responseGuestMessage = await guestMessageService.getByEvent(Number(id));
            setGuestMessage(responseGuestMessage);
            loadTemplate()
        } finally {
            setLoading(false);
        }
    }

    const loadTemplate = () => {
        if (events?.templateId === 1) {
            setSrcTemplate(`${window.location.origin}/bronze/file.html`)
        } else if (events?.templateId === 2) {
            setSrcTemplate(`${window.location.origin}/diamond/file.html`)
        }
    }

    const getImageUrl = (path: string): string => {
        if (!path) return "";
        if (
            path.startsWith("http://") ||
            path.startsWith("https://") ||
            path.startsWith("blob:") ||
            path.startsWith("data:")
        ) {
            return path;
        }
        const apiUrl = process.env.REACT_APP_API_URL || "http://localhost:3000/api";
        const baseUrl = apiUrl.replace(/\/api\/?$/, "");
        return `${baseUrl}${path.startsWith("/") ? "" : "/"}${path}`;
    };

    const handleIframeLoad = () => {
        const iframeDoc = iframeRef.current?.contentDocument;
        if (!iframeDoc) return;

        if (events?.templateId === 1) {
            // Modify the DOM inside the iframe directly after it loads
            const elGuestName = iframeDoc.querySelector('#guestName');
            if (elGuestName) elGuestName.innerHTML = 'Guest';

            const elOpeningText = iframeDoc.querySelector('#openingText');
            if (elOpeningText) elOpeningText.innerHTML = `${wedding?.openingText}`;

            const elNameGroomBride1 = iframeDoc.querySelector('#nameGroomBride1');
            if (elNameGroomBride1) elNameGroomBride1.innerHTML = `${wedding?.namaPanggilanBride} &amp; ${wedding?.namaPanggilanGroom}`;

            const elNameGroomBride2 = iframeDoc.querySelector('#nameGroomBride2');
            if (elNameGroomBride2) elNameGroomBride2.innerHTML = `${wedding?.namaPanggilanBride} &amp; ${wedding?.namaPanggilanGroom}`;

            const elNameGroomBride3 = iframeDoc.querySelector('#nameGroomBride3');
            if (elNameGroomBride3) elNameGroomBride3.innerHTML = `${wedding?.namaPanggilanBride} &amp; ${wedding?.namaPanggilanGroom}`;

            const elTglEvent = iframeDoc.querySelector('#tglEvent');
            if (elTglEvent) elTglEvent.innerHTML = `${moment(events?.date).format('DD')} ${arrMonth[moment(events?.date).month()]} ${moment(events?.date).format('YYYY')}`;

            const elQuote = iframeDoc.querySelector('#quote');
            if (elQuote) elQuote.innerHTML = `${wedding?.quote}`;

            const elNamaBrideLengkap = iframeDoc.querySelector('#namaBrideLengkap');
            if (elNamaBrideLengkap) elNamaBrideLengkap.innerHTML = `${wedding?.namaLengkapBride}`;

            const elBioBride = iframeDoc.querySelector('#bioBride');
            if (elBioBride) elBioBride.innerHTML = `${wedding?.bioBride}`;

            const elNamaGroomLengkap = iframeDoc.querySelector('#namaGroomLengkap');
            if (elNamaGroomLengkap) elNamaGroomLengkap.innerHTML = `${wedding?.namaLengkapGroom}`;

            const elBioGroom = iframeDoc.querySelector('#bioGroom');
            if (elBioGroom) elBioGroom.innerHTML = `${wedding?.bioGroom}`;

            const elLokasi = iframeDoc.querySelector('#container_lokasi');
            if (elLokasi) {
                let child = ``
                for (let i = 0; i < eventLocation.length; i++) {
                    child += `<div class="et_pb_module et_pb_text et_pb_text_12 et_animated et_pb_text_align_center et_pb_bg_layout_light">
                            <div class="et_pb_text_inner">
                            <p>${eventLocation[i].name}</p>
                            </div>
                        </div>
                        <div class="et_pb_module et_pb_text et_pb_text_13 et_animated et_pb_text_align_center et_pb_bg_layout_dark">
                            <div class="et_pb_text_inner">
                            <h4>${arrDay[moment(eventLocation[i].date).day()]}, ${moment(eventLocation[i].date).format('DD')} ${arrMonth[moment(eventLocation[i].date).month()]} ${moment(eventLocation[i].date).format('YYYY')}</h4>
                            <p>${eventLocation[i].startTime.substring(0, 5)} WIB</p>
                            <h3>
                                <span>${eventLocation[i].location}</span>
                            </h3>
                            <p>
                                <span>${eventLocation[i].alamat}</span>
                            </p>
                            </div>
                        </div>
                        ${eventLocation[i].urlMaps === '' ? '' 
                            : `<div class="et_pb_button_module_wrapper et_pb_button_1_wrapper et_pb_button_alignment_center et_pb_module">
                            <a class="et_pb_button et_pb_button_1 et_animated et_pb_bg_layout_light" data-icon="" href="${eventLocation[i].urlMaps}" target="_blank">Lihat Lokasi</a>
                        </div>`}`
                }
                elLokasi.innerHTML = child;
            }
            
            const elGift = iframeDoc.querySelector('#container_gift');
            if (elGift) {
                let child = ``
                for (let i = 0; i < gift.length; i++) {
                    child += `<div class="et_pb_with_border et_pb_row et_pb_row_15">
                            <div class="et_pb_column et_pb_column_4_4 et_pb_column_16 et_pb_css_mix_blend_mode_passthrough et-last-child">
                            <div class="et_pb_module et_pb_text et_pb_text_24 et_pb_text_align_center et_pb_bg_layout_light">
                                <div class="et_pb_text_inner">${gift[i].name} <br /> ${gift[i].provider} </div>
                            </div>
                            <div class="et_pb_module et_pb_divider et_pb_divider_1 et_pb_divider_position_center et_pb_space">
                                <div class="et_pb_divider_internal"></div>
                            </div> 
                            <div class="et_pb_module et_pb_text et_pb_text_25 copy et_pb_text_align_center et_pb_bg_layout_light">
                                <div class="et_pb_text_inner">
                                <p>${gift[i].nomor} </p>
                                </div>
                            </div>
                            <div class="et_pb_button_module_wrapper et_pb_button_7_wrapper et_pb_button_alignment_center et_pb_module">
                                <a class="et_pb_button et_pb_button_7 copy-btn et_pb_bg_layout_light" data-icon="" href="">Copy</a>
                            </div>
                            </div>
                        </div>`
                }
                elGift.innerHTML = child;
            }
            const elHadiah = iframeDoc.querySelector('#hadiah');
            if (elHadiah) {
                elHadiah.className = 'et_pb_section et_pb_section_8 popup et_section_regular'
            }

            const elClockTimer = iframeDoc.querySelector('#clock_timer');
            if (elClockTimer) {
                elClockTimer.setAttribute('data-config', `{"style":"block_clock","finish_countdown":"continue","label_weeks":"Week,Weeks","label_days":"Day,Days","label_hours":"Hour,Hours","label_minutes":"Min,Mins","label_seconds":"Sec,Secs","date":"${moment(events?.date).format('YYYY-MM-DD HH:mm')}","show_weeks":false,"show_days":true,"show_hours":true,"show_minutes":true,"show_seconds":true,"clock_label_position":"below"}`)
                elClockTimer.getAttribute('data-config')
            }

            const photoCover = iframeDoc.querySelector('#welcome-gate')
            if (photoCover && eventPhotoCover) {
                photoCover.setAttribute('style', `background-image: linear-gradient(180deg, rgba(0, 4, 10, 0.36) 68%, #000c0f 100%), url('${getImageUrl(eventPhotoCover.pathImage)}') !important`)
            }

            const photoOpening = iframeDoc.querySelector('#photo_opening')
            if (photoOpening && eventPhotoOpening) {
                photoOpening.setAttribute('style', `background-image: linear-gradient(180deg, rgba(255, 255, 255, 0) 65%, #334037 100%), url('${getImageUrl(eventPhotoOpening.pathImage)}') !important`)
            }

            const photoBackground = iframeDoc.querySelector('#side-panel')
            if (photoBackground && eventPhotoBackground) {
                photoBackground.setAttribute('style', `background-image: linear-gradient(90deg, rgba(255, 255, 255, 0) 44%, #313e35 100%), url('${getImageUrl(eventPhotoBackground.pathImage)}') !important`)
            }

            const photoGallery = iframeDoc.querySelector('#photo_gallery')
            if (photoGallery && eventPhotoGallery) {
                let childImageTop = ``
                let childImageBottom = ``
                for (let i = 0; i < eventPhotoGallery.length; i++) {
                    childImageTop += `<div class="et_pb_module dipi_image_gallery_child dipi_image_gallery_child_0 swiper-slide">
                        <div class="et_pb_module_inner">
                            <div class="swiper-slide-container" href="${getImageUrl(eventPhotoGallery[i].pathImage)}" role="figure" style="background-image:url(${getImageUrl(eventPhotoGallery[i].pathImage)});background-size:cover;background-repeat: no-repeat;"></div>
                        </div>
                    </div>`
                    childImageBottom += `<div class="dipi_image_gallery_child swiper-slide" data-class="dipi_image_gallery_child_0">
                        <div aria-labelledby="" class="swiper-slide-container" role="figure" style="background-image:url(${getImageUrl(eventPhotoGallery[i].pathImage)});background-size:cover;background-repeat: no-repeat;"></div>
                    </div>`
                }
                let childTop = `<div class="dipi-image-gallery-top">
                        <div class="swiper-container dipi-image-gallery-top_0" data-animation="slide" data-autoplay="on" data-autoplay_delay="2000" data-direction="horizontal" data-enable_popup="off" data-main_redraw_after_slide_changed="off" data-navigation="off" data-ordernumber="0" data-pause_on_hover="off" data-popup_animation="none" data-popup_animation_duration="500">
                            <div class="swiper-wrapper">${childImageTop}</div>
                        </div>
                    </div>`
                let childBottom = `<div class="dipi-image-gallery-thumbs">
                        <div class="swiper-container dipi-image-gallery-thumbs_0 dipi-thumbs-horizontal dipi-img-thumbs-bottom" data-centered="on" data-columnsdesktop="4" data-columnsphone="4" data-columnstablet="4" data-direction="horizontal" data-is_tb_body="off" data-navigation="off" data-ordernumber="0" data-spacebetween="10" data-spacebetween_phone="10" data-spacebetween_tablet="10" data-thumbs_loop="on">
                            <div class="swiper-wrapper">${childImageBottom}</div>
                        </div>
                    </div>`
                let child = `${childTop}${childBottom}`
                photoGallery.innerHTML = child
            }

            const elGuestMessage = iframeDoc.querySelector('#saic-container-comment-25094208')
            if (elGuestMessage && guestMessage) {
                let child = ``
                for (let i = 0; i < guestMessage.length; i++) {
                    child += `<li class="comment even thread-even depth-1 saic-item-comment" id="saic-item-comment-573" data-likes="0">
                        <div id="saic-comment-573" class="saic-comment saic-clearfix">
                            <div class="saic-comment-avatar"></div>
                            <!--.saic-comment-avatar-->
                            <div class="saic-comment-content">
                                <div class="saic-comment-info">
                                    <a class="saic-commenter-name" title="${guestMessage[i].guestName}">${guestMessage[i].guestName}</a>
                                </div>
                                <!--.saic-comment-info-->
                                <div class="saic-comment-text">
                                    <p>${guestMessage[i].message}</p>
                                </div>
                                <!--.saic-comment-text-->
                            </div>
                            <!--.saic-comment-content-->
                        </div>
                        <!--.saic-comment-->
                    </li>`
                }
                elGuestMessage.innerHTML = child
            }

            const music = iframeDoc.querySelector('#music')
            if (music && events && events.music_url !== '') {
                music.setAttribute('src', events.music_url)
            }

            const body = iframeDoc.querySelector('body');
            if (body) {
                let nodeCountdown = iframeDoc.createElement('script');
                nodeCountdown.setAttribute('id', 'dipi_countdown_public-js')
                nodeCountdown.setAttribute('src', 'assets/Countdown.min.js')
                
                let nodeGallery = iframeDoc.createElement('script');
                nodeGallery.setAttribute('id', 'dipi_image_gallery_public-js')
                nodeGallery.setAttribute('src', 'assets/ImageGallery.min.js')

                let nodeConst = iframeDoc.createElement('script');
                nodeConst.innerText = `const eventId="${events?.id}"; const guestId="0"; const guestName="Preview";`

                body.appendChild(nodeCountdown);
                body.appendChild(nodeGallery);
                body.appendChild(nodeConst);
            }
        } else if (events?.templateId === 2) {
            // Modify the DOM inside the iframe directly after it loads
            const elGuestName = iframeDoc.querySelector('#guestName');
            if (elGuestName) elGuestName.innerHTML = 'Dear Guest';

            const elOpeningText = iframeDoc.querySelector('#openingText');
            if (elOpeningText) elOpeningText.innerHTML = `${wedding?.openingText}`;

            const elNameGroomBride1 = iframeDoc.querySelector('#nameGroomBride1');
            if (elNameGroomBride1) elNameGroomBride1.innerHTML = `${wedding?.namaPanggilanBride} &amp; ${wedding?.namaPanggilanGroom}`;

            const elNameGroomBride2 = iframeDoc.querySelector('#nameGroomBride2');
            if (elNameGroomBride2) elNameGroomBride2.innerHTML = `${wedding?.namaPanggilanBride} &amp; ${wedding?.namaPanggilanGroom}`;

            const elNameGroomBride3 = iframeDoc.querySelector('#nameGroomBride3');
            if (elNameGroomBride3) elNameGroomBride3.innerHTML = `${wedding?.namaPanggilanBride} &amp; ${wedding?.namaPanggilanGroom}`;

            const elNameGroomBride4 = iframeDoc.querySelector('#nameGroomBride4');
            if (elNameGroomBride4) elNameGroomBride4.innerHTML = `${wedding?.namaPanggilanBride} &amp; ${wedding?.namaPanggilanGroom}`;

            const elSocialMediaBride = iframeDoc.querySelector('#socialMediaBride');
            if (elSocialMediaBride && wedding && wedding?.sosmedBride !== '') elSocialMediaBride.setAttribute('href', wedding?.sosmedBride);

            const elSocialMediaGroom = iframeDoc.querySelector('#socialMediaGroom');
            if (elSocialMediaGroom && wedding && wedding?.sosmedGroom !== '') elSocialMediaGroom.setAttribute('href', wedding?.sosmedGroom);

            const elTglEvent = iframeDoc.querySelector('#tglEvent');
            if (elTglEvent) elTglEvent.innerHTML = `${moment(events?.date).format('DD')} . ${moment(events?.date).month() + 1} . ${moment(events?.date).format('YYYY')}`;

            const elQuote = iframeDoc.querySelector('#quote');
            if (elQuote) elQuote.innerHTML = `${wedding?.quote}`;

            const elNamaBrideLengkap = iframeDoc.querySelector('#namaBrideLengkap');
            if (elNamaBrideLengkap) elNamaBrideLengkap.innerHTML = `${wedding?.namaLengkapBride}`;

            const elBioBride = iframeDoc.querySelector('#bioBride');
            if (elBioBride) elBioBride.innerHTML = `${wedding?.bioBride}`;

            const elNamaGroomLengkap = iframeDoc.querySelector('#namaGroomLengkap');
            if (elNamaGroomLengkap) elNamaGroomLengkap.innerHTML = `${wedding?.namaLengkapGroom}`;

            const elBioGroom = iframeDoc.querySelector('#bioGroom');
            if (elBioGroom) elBioGroom.innerHTML = `${wedding?.bioGroom}`;

            const elLokasi = iframeDoc.querySelector('#container_lokasi');
            if (elLokasi) {
                let child = ``
                for (let i = 0; i < eventLocation.length; i++) {
                    child += `
                        <div class="et_pb_row et_pb_row_16">
                            <div class="et_pb_column et_pb_column_4_4 et_pb_column_16 et_pb_css_mix_blend_mode_passthrough et-last-child">
                            <div class="et_pb_module et_pb_image et_pb_image_45">
                                <span class="et_pb_image_wrap">
                                <img alt="" class="wp-image-25219457" decoding="async" fetchpriority="high" height="450" sizes="(max-width: 357px) 100vw, 357px" src="assets/Truby-Rifqi-asst12.png" title="" width="357" />
                                </span>
                            </div>
                            <div class="et_pb_module et_pb_image et_pb_image_46">
                                <span class="et_pb_image_wrap">
                                <img alt="" class="wp-image-25219458" decoding="async" height="550" sizes="(max-width: 423px) 100vw, 423px" src="assets/Truby-Rifqi-asst11.png" title="" width="423" />
                                </span>
                            </div>
                            <div class="et_pb_module et_pb_image et_pb_image_47 wiggle-top-right wiggle-slow et_animated et-waypoint">
                                <span class="et_pb_image_wrap">
                                <img alt="" class="wp-image-25219440" decoding="async" height="500" sizes="(max-width: 326px) 100vw, 326px" src="assets/Truby-Rifqi-asst3.png" title="" width="326" />
                                </span>
                            </div>
                            <div class="et_pb_module et_pb_image et_pb_image_48 wiggle-top-left wiggle-slow et_animated et-waypoint">
                                <span class="et_pb_image_wrap">
                                <img alt="" class="wp-image-25219439" decoding="async" height="660" sizes="(max-width: 300px) 100vw, 300px" src="assets/Truby-Rifqi-asst4.png" title="" width="300" />
                                </span>
                            </div>
                            <div class="et_pb_module et_pb_image et_pb_image_49 wiggle-bottom-left et_animated et-waypoint">
                                <span class="et_pb_image_wrap">
                                <img alt="" class="wp-image-25219449" decoding="async" height="300" sizes="(max-width: 312px) 100vw, 312px" src="assets/Truby-Rifqi-asst5.png" title="" width="312" />
                                </span>
                            </div>
                            <div class="et_pb_module et_pb_image et_pb_image_50 wiggle-bottom-center et_animated et-waypoint">
                                <span class="et_pb_image_wrap">
                                <img alt="" class="wp-image-25219449" decoding="async" height="300" sizes="(max-width: 312px) 100vw, 312px" src="assets/Truby-Rifqi-asst5.png" title="" width="312" />
                                </span>
                            </div>
                            <div class="et_pb_module et_pb_image et_pb_image_51">
                                <span class="et_pb_image_wrap">
                                <img alt="" class="wp-image-25219464" decoding="async" height="144" src="assets/Truby-Rifqi-gif-1.gif" title="" width="200" />
                                </span>
                            </div>
                            <div class="et_pb_module et_pb_image et_pb_image_52 wiggle-bottom-left et_animated et-waypoint">
                                <span class="et_pb_image_wrap">
                                <img alt="" class="wp-image-25219453" decoding="async" height="500" sizes="(max-width: 280px) 100vw, 280px" src="assets/Truby-Rifqi-asst16.png" title="" width="280" />
                                </span>
                            </div>
                            <div class="et_pb_module et_pb_image et_pb_image_53 wiggle-bottom-right et_animated et-waypoint">
                                <span class="et_pb_image_wrap">
                                <img alt="" class="wp-image-25219465" decoding="async" height="450" sizes="(max-width: 311px) 100vw, 311px" src="assets/Truby-Rifqi-asst2.png" title="" width="311" />
                                </span>
                            </div>
                            </div>
                        </div>
                        <div class="et_pb_with_border et_pb_row et_pb_row_17">
                            <div class="et_pb_column et_pb_column_4_4 et_pb_column_17 et_pb_css_mix_blend_mode_passthrough et-last-child">
                            <div class="et_pb_module et_pb_text et_pb_text_9 et_animated et_pb_text_align_center et_pb_bg_layout_light">
                                <div class="et_pb_text_inner">
                                <p>
                                    <span>${arrDay[moment(eventLocation[i].date).day()]}, <br />${moment(eventLocation[i].date).format('DD')} ${arrMonth[moment(eventLocation[i].date).month()]} ${moment(eventLocation[i].date).format('YYYY')}</span>
                                </p>
                                </div>
                            </div>
                            <div class="et_pb_module et_pb_divider et_pb_divider_1 et_pb_divider_position_ et_pb_space">
                                <div class="et_pb_divider_internal"></div>
                            </div>
                            </div>
                        </div>
                        <div class="et_pb_with_border et_pb_row et_pb_row_19">
                            <div class="et_pb_column et_pb_column_4_4 et_pb_column_20 et_pb_css_mix_blend_mode_passthrough et-last-child">
                            <div class="et_pb_module et_pb_divider et_pb_divider_2 et_animated et_pb_divider_position_center et_pb_space">
                                <div class="et_pb_divider_internal"></div>
                            </div>
                            <div class="et_pb_module et_pb_text et_pb_text_14 et_animated et_pb_text_align_center et_pb_bg_layout_dark">
                                <div class="et_pb_text_inner">
                                <h4>
                                    <span>${eventLocation[i].location} </span>
                                </h4>
                                <p>
                                    <span>${eventLocation[i].startTime.substring(0, 5)} WIB</span>
                                </p>
                                <p>${eventLocation[i].alamat}</p>
                                </div>
                            </div>
                            <div class="et_pb_button_module_wrapper et_pb_button_3_wrapper et_pb_button_alignment_center et_pb_module">
                                <a class="et_pb_button et_pb_button_3 et_animated et_pb_bg_layout_light" data-icon="" href="${eventLocation[i].urlMaps}" target="_blank">View Location</a>
                            </div>
                            </div>
                        </div>
                        <div class="et_pb_row et_pb_row_20">
                            <div class="et_pb_column et_pb_column_4_4 et_pb_column_21 et_pb_css_mix_blend_mode_passthrough et-last-child">
                            <div class="et_pb_module et_pb_image et_pb_image_54">
                                <span class="et_pb_image_wrap">
                                <img alt="" class="wp-image-25219451" decoding="async" height="285" sizes="(min-width: 0px) and (max-width: 480px) 480px, (min-width: 481px) 550px, 100vw" src="assets/Truby-Rifqi-asst10.png" title="" width="550" />
                                </span>
                            </div>
                            <div class="et_pb_module et_pb_image et_pb_image_55 et_animated et-waypoint">
                                <span class="et_pb_image_wrap">
                                <img alt="" class="wp-image-25219466" decoding="async" height="550" sizes="(max-width: 348px) 100vw, 348px" src="assets/Truby-Rifqi-asst18.png" title="" width="348" />
                                </span>
                            </div>
                            <div class="et_pb_module et_pb_image et_pb_image_56 wiggle-bottom-center wiggle-slow">
                                <span class="et_pb_image_wrap">
                                <img alt="" class="wp-image-25219452" decoding="async" height="235" sizes="(min-width: 0px) and (max-width: 480px) 480px, (min-width: 481px) 550px, 100vw" src="assets/Truby-Rifqi-asst9.png" title="" width="550" />
                                </span>
                            </div>
                            <div class="et_pb_module et_pb_image et_pb_image_57 wiggle-bottom-right et_animated et-waypoint">
                                <span class="et_pb_image_wrap">
                                <img alt="" class="wp-image-25219460" decoding="async" height="550" sizes="(max-width: 255px) 100vw, 255px" src="assets/Truby-Rifqi-asst7.png" title="" width="255" />
                                </span>
                            </div>
                            <div class="et_pb_module et_pb_image et_pb_image_58 wiggle-bottom-left et_animated et-waypoint">
                                <span class="et_pb_image_wrap">
                                <img alt="" class="wp-image-25219459" decoding="async" height="831" sizes="(max-width: 407px) 100vw, 407px" src="assets/Truby-Rifqi-asst6.png" title="" width="407" />
                                </span>
                            </div>
                            <div class="et_pb_module et_pb_image et_pb_image_59 wiggle-bottom-center et_animated et-waypoint">
                                <span class="et_pb_image_wrap">
                                <img alt="" class="wp-image-25219453" decoding="async" height="500" sizes="(max-width: 280px) 100vw, 280px" src="assets/Truby-Rifqi-asst16.png" title="" width="280" />
                                </span>
                            </div>
                            <div class="et_pb_module et_pb_image et_pb_image_60 wiggle-bottom-center wiggle-slow et_animated et-waypoint">
                                <span class="et_pb_image_wrap">
                                <img alt="" class="wp-image-25219449" decoding="async" height="300" sizes="(max-width: 312px) 100vw, 312px" src="assets/Truby-Rifqi-asst5.png" title="" width="312" />
                                </span>
                            </div>
                            <div class="et_pb_module et_pb_image et_pb_image_61 et_animated et-waypoint">
                                <span class="et_pb_image_wrap">
                                <img alt="" class="wp-image-25219443" decoding="async" height="266" src="assets/1912230_7d1da-trubby.gif" title="" width="448" />
                                </span>
                            </div>
                            <div class="et_pb_module et_pb_image et_pb_image_62 wiggle-bottom-left et_animated et-waypoint">
                                <span class="et_pb_image_wrap">
                                <img alt="" class="wp-image-25219454" decoding="async" height="400" sizes="(max-width: 406px) 100vw, 406px" src="assets/Truby-Rifqi-asst15.png" title="" width="406" />
                                </span>
                            </div>
                            <div class="et_pb_module et_pb_image et_pb_image_63 wiggle-bottom-left wiggle-slow et_animated et-waypoint">
                                <span class="et_pb_image_wrap">
                                <img alt="" class="wp-image-25219449" decoding="async" height="300" sizes="(max-width: 312px) 100vw, 312px" src="assets/Truby-Rifqi-asst5.png" title="" width="312" />
                                </span>
                            </div>
                            </div>
                        </div>`
                }
                elLokasi.innerHTML = child;
            }
            
            const elGift = iframeDoc.querySelector('#container_gift');
            if (elGift) {
                let child = ``
                for (let i = 0; i < gift.length; i++) {
                    child += `<div class="et_pb_with_border et_pb_row et_pb_row_31">
                            <div class="et_pb_column et_pb_column_4_4 et_pb_column_33 et_pb_css_mix_blend_mode_passthrough et-last-child">
                            <div class="et_pb_module et_pb_text et_pb_text_26 et_pb_text_align_center et_pb_bg_layout_light">
                                <div class="et_pb_text_inner">${gift[i].name} <br /> ${gift[i].provider} </div>
                            </div>
                            <div class="et_pb_module et_pb_divider et_pb_divider_3 et_pb_divider_position_center et_pb_space">
                                <div class="et_pb_divider_internal"></div>
                            </div>
                            <div class="et_pb_module et_pb_text et_pb_text_27 copy et_pb_text_align_center et_pb_bg_layout_light">
                                <div class="et_pb_text_inner">
                                <p>${gift[i].nomor}</p>
                                </div>
                            </div>
                            <div class="et_pb_button_module_wrapper et_pb_button_9_wrapper et_pb_button_alignment_center et_pb_module">
                                <a class="et_pb_button et_pb_button_9 copy-btn et_pb_bg_layout_light" data-icon="" href="">Copy</a>
                            </div>
                            </div>
                        </div>`
                }
                elGift.innerHTML = child;
            }
            const elHadiah = iframeDoc.querySelector('#hadiah');
            if (elHadiah) {
                elHadiah.className = 'et_pb_section et_pb_section_10 popup et_section_regular'
            }

            const elClockTimer = iframeDoc.querySelector('#clock_timer');
            if (elClockTimer) {
                elClockTimer.setAttribute('data-config', `{"style":"block_clock","finish_countdown":"continue","label_weeks":"Week,Weeks","label_days":"Day,Days","label_hours":"Hour,Hours","label_minutes":"Min,Mins","label_seconds":"Sec,Secs","date":"${moment(events?.date).format('YYYY-MM-DD HH:mm')}","show_weeks":false,"show_days":true,"show_hours":true,"show_minutes":true,"show_seconds":true,"clock_label_position":"below"}`)
                elClockTimer.getAttribute('data-config')
            }

            const photoCover = iframeDoc.querySelector('#welcome-gate')
            if (photoCover && eventPhotoCover) {
                photoCover.setAttribute('style', `background-image: linear-gradient(180deg, rgba(0, 4, 10, 0.36) 68%, #000c0f 100%), url('${getImageUrl(eventPhotoCover.pathImage)}') !important`)
            }

            const photoOpening = iframeDoc.querySelector('#photo_opening')
            if (photoOpening && eventPhotoOpening) {
                photoOpening.setAttribute('style', `background-image: linear-gradient(180deg, rgba(255, 255, 255, 0) 65%, #334037 100%), url('${getImageUrl(eventPhotoOpening.pathImage)}') !important`)
            }

            const photoBackground = iframeDoc.querySelector('#side-panel')
            if (photoBackground && eventPhotoBackground) {
                photoBackground.setAttribute('style', `background-image: linear-gradient(90deg, rgba(255, 255, 255, 0) 44%, #313e35 100%), url('${getImageUrl(eventPhotoBackground.pathImage)}') !important`)
            }

            const photoQuote = iframeDoc.querySelector('#photo_quote')
            if (photoQuote && eventPhotoQuote) {
                photoQuote.setAttribute('src', `${getImageUrl(eventPhotoQuote.pathImage)}`)
            }

            const photoProfilBride = iframeDoc.querySelector('#photo_profil_bride')
            if (photoProfilBride && eventPhotoProfilBride) {
                photoProfilBride.setAttribute('src', `${getImageUrl(eventPhotoProfilBride.pathImage)}`)
            }

            const photoProfilGroom = iframeDoc.querySelector('#photo_profil_groom')
            if (photoProfilGroom && eventPhotoProfilGroom) {
                photoProfilGroom.setAttribute('src', `${getImageUrl(eventPhotoProfilGroom.pathImage)}`)
            }

            const photoSaveTheDate = iframeDoc.querySelector('#photo_save_the_date')
            if (photoSaveTheDate && eventPhotoSaveTheDate) {
                photoSaveTheDate.setAttribute('style', `background-image: url('${getImageUrl(eventPhotoSaveTheDate.pathImage)}') !important`)
            }

            const photoAkhir = iframeDoc.querySelector('#photo_akhir')
            if (photoAkhir && eventPhotoAkhir) {
                photoAkhir.setAttribute('style', `background-image: url('${getImageUrl(eventPhotoAkhir.pathImage)}') !important`)
            }

            const containerPhotoGallery = iframeDoc.querySelector('#container_photo_gallery')
            const photoGallery = iframeDoc.querySelector('#photo_gallery')
            if (containerPhotoGallery && photoGallery && eventPhotoGallery) {
                containerPhotoGallery.className = 'et_pb_with_border et_pb_module et_pb_slider et_pb_slider_0 et_pb_slider_fullwidth_off et_slider_auto et_slider_speed_3500 et_slider_auto_ignore_hover'
                let child = ``
                for (let i = 0; i < eventPhotoGallery.length; i++) {
                    child += `<div class="et_pb_slide et_pb_slide_${i} et_pb_bg_layout_dark et_pb_media_alignment_center et-pb-active-slide" data-slide-id="et_pb_slide_${i}" 
                        style="background-image: url(${getImageUrl(eventPhotoGallery[i].pathImage)}); background-color: #FFFFFF;">
                            <div class="et_pb_container clearfix">
                                <div class="et_pb_slider_container_inner">
                                    <div class="et_pb_slide_description"></div>
                                </div>
                            </div>
                        </div>`
                }
                photoGallery.innerHTML = child
            }

            const elGuestMessage = iframeDoc.querySelector('#saic-container-comment-25094208')
            if (elGuestMessage && guestMessage) {
                let child = ``
                for (let i = 0; i < guestMessage.length; i++) {
                    child += `<li class="comment even thread-even depth-1 saic-item-comment" id="saic-item-comment-573" data-likes="0">
                        <div id="saic-comment-573" class="saic-comment saic-clearfix">
                            <div class="saic-comment-avatar"></div>
                            <!--.saic-comment-avatar-->
                            <div class="saic-comment-content">
                                <div class="saic-comment-info">
                                    <a class="saic-commenter-name" title="${guestMessage[i].guestName}">${guestMessage[i].guestName}</a>
                                </div>
                                <!--.saic-comment-info-->
                                <div class="saic-comment-text">
                                    <p>${guestMessage[i].message}</p>
                                </div>
                                <!--.saic-comment-text-->
                            </div>
                            <!--.saic-comment-content-->
                        </div>
                        <!--.saic-comment-->
                    </li>`
                }
                elGuestMessage.innerHTML = child
            }

            const music = iframeDoc.querySelector('#music')
            if (music && events && events.music_url !== '') {
                music.setAttribute('src', events.music_url)
            }

            const body = iframeDoc.querySelector('body');
            if (body) {
                let nodeCountdown = iframeDoc.createElement('script');
                nodeCountdown.setAttribute('id', 'dipi_countdown_public-js')
                nodeCountdown.setAttribute('src', 'assets/Countdown.min.js')
                
                let nodeGallery = iframeDoc.createElement('script');
                nodeGallery.setAttribute('id', 'divi-custom-script-js')
                nodeGallery.setAttribute('src', 'assets/scripts.min.js')

                let nodeConst = iframeDoc.createElement('script');
                nodeConst.innerText = `const eventId="${events?.id}"; const guestId="0"; const guestName="Preview";`

                body.appendChild(nodeCountdown);
                body.appendChild(nodeGallery);
                body.appendChild(nodeConst);
            }
        }
    };

	return (
        <div style={{ width: '100%', height: window.innerHeight - 5 }}>
            <iframe 
                ref={iframeRef}
                src={srcTemplate}
                onLoad={handleIframeLoad}
                title="Invitation"
                width="100%" 
                height="100%"
                style={{ border: 'none' }}
            />
        </div>
	);
};

export default EventList;
