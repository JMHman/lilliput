    // ===== 언어 사전 =====
    const dict = {
        ko:{title:"대기 등록",phoneLabel:"전화번호",hint:"대기 여부를 확인하려면 전체 번호를 입력해 주세요.",
            check:"확인",nameLabel:"이름",adults:"어른",children:"아이",join:"대기 등록",back:"뒤로",
            modalTitle:"대기 안내",close:"닫기",
            statusExisting:({pos,total})=>`앞에 ${pos}팀 대기 중입니다 (전체 ${total}팀).`,
            statusRegistered:({pos,total})=>`등록되었습니다! 앞에 ${pos}팀 대기 중입니다 (전체 ${total}팀).`,
            autoClose:(s)=>`${s}초 후 자동 닫힘`,phName:"이름",phPhone:"01012345678"},
        en:{title:"Waiting Registration",phoneLabel:"Phone Number",hint:"Enter your full number to check your status.",
            check:"Check",nameLabel:"Name",adults:"Adults",children:"Children",join:"Add to Waiting",back:"Back",
            modalTitle:"Waiting Status",close:"Close",
            statusExisting:({pos,total})=>`There are ${pos} teams ahead of you (Total: ${total}).`,
            statusRegistered:({pos,total})=>`Registered! There are ${pos} teams ahead of you (Total: ${total}).`,
            autoClose:(s)=>`Auto close in ${s}s`,phName:"Your name",phPhone:"01012345678"},
        ja:{title:"待機登録",phoneLabel:"電話番号",hint:"待機状況を確認するには番号をすべて入力してください。",
            check:"確認",nameLabel:"お名前",adults:"大人",children:"子ども",join:"待機に追加",back:"戻る",
            modalTitle:"待機案内",close:"閉じる",
            statusExisting:({pos,total})=>`前に ${pos} 組お待ちです（合計 ${total} 組）。`,
            statusRegistered:({pos,total})=>`登録しました！前に ${pos} 組お待ちです（合計 ${total} 組）。`,
            autoClose:(s)=>`${s}秒後に自動で閉じます`,phName:"お名前",phPhone:"01012345678"},
        zh:{title:"等候登记",phoneLabel:"电话号码",hint:"请输入完整号码以查询等候状态。",
            check:"查询",nameLabel:"姓名",adults:"成人",children:"儿童",join:"加入等候",back:"返回",
            modalTitle:"等候提示",close:"关闭",
            statusExisting:({pos,total})=>`您前面还有 ${pos} 组（共 ${total} 组）。`,
            statusRegistered:({pos,total})=>`已登记！您前面还有 ${pos} 组（共 ${total} 组）。`,
            autoClose:(s)=>`${s} 秒后自动关闭`,phName:"姓名",phPhone:"01012345678"}
    };
    
    // ===== 요소 =====
    const $ = id => document.getElementById(id);
    //   const langSel=$("lang"), stepPhone=$("step-phone"), stepNew=$("step-new");
    const stepPhone = document.getElementById("step-phone");
    const stepNew   = document.getElementById("step-new");
    const langSwitch = document.getElementById("lang-switch");
    const langButtons = langSwitch ? Array.from(langSwitch.querySelectorAll("button")) : []; 
    const phoneEl=$("phone"), nameEl=$("name"), adultsEl=$("adults"), childrenEl=$("children");
    const btnCheck=$("btn-check"), btnJoin=$("btn-join"), btnBack=$("btn-back");
    const backdrop=$("backdrop"), modalText=$("modal-text"), modalTimer=$("modal-timer"), btnClose=$("btn-close");
    const t={ title:$("t-title"), phoneLabel:$("t-phone-label"), hint:$("t-hint"),
                nameLabel:$("t-name-label"), adults:$("t-adults-label"), children:$("t-children-label"),
                modalTitle:$("t-modal-title") };
    
    let lastPhone="", closeTimer=null;
    const AUTO_CLOSE_MS=10000;

    function setActiveLangButton(lang){
        langButtons.forEach(b=>{
        b.classList.toggle("active", b.dataset.lang === lang);
        });
    }
    
    
    // ===== 언어 결정: 1) 사용자가 바꿨다면 그 값(localStorage) 2) 아니면 시스템 언어 3) 기본 ko
    function detectSystemLang(){
        const n = (navigator.language || navigator.userLanguage || "ko").toLowerCase();
        if(n.startsWith("ko")) return "ko";
        if(n.startsWith("en")) return "en";
        if(n.startsWith("ja")) return "ja";
        if(n.startsWith("zh")) return "zh";
        return "ko";
    }
    function getCurrentLang(){
        const override = localStorage.getItem("pad_lang_override");
        return override || detectSystemLang();
    }
    function applyLang(lang){
        const L = dict[lang] ? lang : "ko";
        document.documentElement.lang = L;
        phoneEl.setAttribute("inputmode","numeric");

        setActiveLangButton(L); // ← 추가
    
        const d = dict[L];
        t.title.textContent = d.title;
        t.phoneLabel.textContent = d.phoneLabel;
        t.hint.textContent = d.hint;
        btnCheck.textContent = d.check;
        t.nameLabel.textContent = d.nameLabel;
        t.adults.textContent = d.adults;
        t.children.textContent = d.children;
        btnJoin.textContent = d.join;
        btnBack.textContent = d.back;
        t.modalTitle.textContent = d.modalTitle;
        btnClose.textContent = d.close;
        nameEl.placeholder = d.phName;
        phoneEl.placeholder = d.phPhone;
        phoneEl.setAttribute("inputmode","numeric");
    }
    if (langSwitch) {
        langSwitch.addEventListener("click", (e)=>{
          const btn = e.target.closest("button[data-lang]");
          if(!btn) return;
          const val = btn.dataset.lang;
          localStorage.setItem("pad_lang_override", val);
          applyLang(val);
        });
      }
      
    
    // ===== 유틸 =====
    function normalizePhone(s){ return String(s||"").replace(/\D+/g,""); }
    function show(el){ el.classList.remove("hidden"); }
    function hide(el){ el.classList.add("hidden"); }
    function setDisabled(el,on){ el.disabled=!!on; }
    function showModal(message){
        modalText.textContent=message;
        backdrop.style.display="flex";
        let remain = AUTO_CLOSE_MS/1000;
        modalTimer.textContent = dict[getCurrentLang()].autoClose(remain);
        closeTimer && clearInterval(closeTimer);
        closeTimer = setInterval(()=>{
        remain -= 1;
        if(remain<=0){ hideModal(); }
        else modalTimer.textContent = dict[getCurrentLang()].autoClose(remain);
        },1000);
    }
    function hideModal(){
        backdrop.style.display="none";
        closeTimer && clearInterval(closeTimer);
        closeTimer=null; modalTimer.textContent="";
    }
    btnClose.addEventListener("click", hideModal);
    
    // ===== 동작 =====
    btnCheck.addEventListener("click", async ()=>{
        const phone = normalizePhone(phoneEl.value);
        if(!phone){ phoneEl.focus(); return; }
        setDisabled(btnCheck,true);
        try{
        const r = await fetch(`/api/waiting/check?phone=${encodeURIComponent(phone)}`);
        if(!r.ok){ show(stepNew); hide(stepPhone); lastPhone=phone; return; }
        const data = await r.json();
        const L = dict[getCurrentLang()];
        if(data && data.exists){
            const pos=Number(data.position||0), total=Number(data.total||0);
            showModal(L.statusExisting({pos,total}));
            phoneEl.value="";
        }else{
            show(stepNew); hide(stepPhone); lastPhone=phone;
        }
        }catch(e){
        console.error(e);
        show(stepNew); hide(stepPhone); lastPhone=phone;
        }finally{
        setDisabled(btnCheck,false);
        }
    });
    btnBack.addEventListener("click", ()=>{
        hide(stepNew); show(stepPhone);
        nameEl.value=""; adultsEl.value=1; childrenEl.value=0;
    });
    btnJoin.addEventListener("click", async ()=>{
        const name=(nameEl.value||"").trim();
        const adults=Math.max(0, parseInt(adultsEl.value||"0",10));
        const children=Math.max(0, parseInt(childrenEl.value||"0",10));
        const phone= lastPhone || normalizePhone(phoneEl.value);
        if(!phone){ hide(stepNew); show(stepPhone); return; }
        if(!name){ nameEl.focus(); return; }
        setDisabled(btnJoin,true);
        try{
        const r = await fetch("/api/waiting",{
            method:"POST", headers:{"Content-Type":"application/json"},
            body:JSON.stringify({name,phone,adults,children})
        });
        const L = dict[getCurrentLang()];
        if(!r.ok){ showModal("Registration failed. Please ask our staff."); return; }
        const data=await r.json();
        const pos=Number(data.position||0), total=Number(data.total||0);
        showModal(L.statusRegistered({pos,total}));
        phoneEl.value=""; nameEl.value=""; adultsEl.value=1; childrenEl.value=0;
        hide(stepNew); show(stepPhone);
        }catch(e){
        console.error(e);
        showModal("Network error. Please try again.");
        }finally{
        setDisabled(btnJoin,false);
        }
    });
    
    // 초기 언어 적용(override 없으면 시스템 언어로)
    applyLang(getCurrentLang());
    