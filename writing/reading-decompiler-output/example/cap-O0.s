	.text
	.intel_syntax noprefix
	.file	"cap.c"
	.globl	cap_unsigned                    # -- Begin function cap_unsigned
	.p2align	4, 0x90
	.type	cap_unsigned,@function
cap_unsigned:                           # @cap_unsigned
# %bb.0:
	push	rbp
	mov	rbp, rsp
	mov	dword ptr [rbp - 8], edi
	cmp	dword ptr [rbp - 8], 7
	jbe	.LBB0_2
# %bb.1:
	mov	dword ptr [rbp - 4], 7
	jmp	.LBB0_3
.LBB0_2:
	mov	eax, dword ptr [rbp - 8]
	mov	dword ptr [rbp - 4], eax
.LBB0_3:
	mov	eax, dword ptr [rbp - 4]
	pop	rbp
	ret
.Lfunc_end0:
	.size	cap_unsigned, .Lfunc_end0-cap_unsigned
                                        # -- End function
	.globl	cap_signed                      # -- Begin function cap_signed
	.p2align	4, 0x90
	.type	cap_signed,@function
cap_signed:                             # @cap_signed
# %bb.0:
	push	rbp
	mov	rbp, rsp
	mov	dword ptr [rbp - 8], edi
	cmp	dword ptr [rbp - 8], 7
	jle	.LBB1_2
# %bb.1:
	mov	dword ptr [rbp - 4], 7
	jmp	.LBB1_3
.LBB1_2:
	mov	eax, dword ptr [rbp - 8]
	mov	dword ptr [rbp - 4], eax
.LBB1_3:
	mov	eax, dword ptr [rbp - 4]
	pop	rbp
	ret
.Lfunc_end1:
	.size	cap_signed, .Lfunc_end1-cap_signed
                                        # -- End function
	.ident	"Ubuntu clang version 18.1.3 (1ubuntu1)"
	.section	".note.GNU-stack","",@progbits
	.addrsig
